

import { supabase } from '@/integrations/supabase/client';

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Load Razorpay SDK safely
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
};

interface RazorpayPaymentOptions {
    consultationId: string;
    onSuccess: (consultationId: string) => void;
    onError: (error: string) => void;
    closeModal?: () => void; // 🔥 IMPORTANT FIX
}

export const initiateRazorpayPayment = async ({
    consultationId,
    onSuccess,
    onError,
    closeModal,
}: RazorpayPaymentOptions) => {
    try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            onError('Razorpay SDK failed to load');
            return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (!session) {
            onError('Not authenticated');
            return;
        }

        // 1️⃣ Create Order
        const { data, error } = await supabase.functions.invoke('razorpay', {
            body: {
                action: 'create_order',
                consultation_id: consultationId,
            },
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        if (error || !data) {
            console.error(error);
            onError(error?.message || 'Order creation failed');
            return;
        }

        const { order_id, amount, currency, key_id } = data;
        // Fetch consultation details
        const { data: consultation } = await supabase
            .from('consultations')
            .select('lawyer_id, total_amount')
            .eq('id', consultationId)
            .single();

        // Create pending payment entry
        await supabase.from('payments').insert({
            consultation_id: consultationId,

            client_id: session.user.id,

            lawyer_id: consultation?.lawyer_id,

            razorpay_order_id: order_id,

            amount: consultation?.total_amount || amount / 100,

            payment_status: 'pending',

            payment_method: 'razorpay',
        });

        // Auto cancel pending payment after 3 minutes
        setTimeout(async () => {
            try {
                const { data: payment } = await supabase
                    .from('payments')
                    .select('payment_status')
                    .eq('razorpay_order_id', order_id)
                    .single();

                // Only cancel if still pending
                if (payment?.payment_status === 'pending') {
                    await supabase
                        .from('payments')
                        .update({
                            payment_status: 'cancelled',
                        })
                        .eq('razorpay_order_id', order_id);

                    console.log('⏰ Payment auto-cancelled after 3 minutes');
                }
            } catch (err) {
                console.error('Auto cancel error:', err);
            }
        }, 3 * 60 * 1000);

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', session.user.id)
            .single();

        // 2️⃣ Razorpay Options
        const options = {
            key: key_id,
            amount,
            currency,
            name: 'LEGALMATE',
            description: 'Consultation Payment',
            order_id,

            handler: async (response: any) => {
                console.log('PAYMENT SUCCESS:', response);

                const { data: verifyData, error: verifyError } =
                    await supabase.functions.invoke('razorpay', {
                        body: {
                            action: 'verify_payment',
                            consultation_id: consultationId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        },
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    });

                console.log('VERIFY RESPONSE:', verifyData, verifyError);

                if (verifyError || !verifyData?.ok) {
                    onError('Payment verification failed');
                    return;
                }

                console.log("VERIFY SUCCESS");

                const { error: paymentUpdateError } = await supabase
                    .from('payments')
                    .update({
                        payment_status: 'completed',
                        razorpay_payment_id:
                            response.razorpay_payment_id,
                    })
                    .eq('consultation_id', consultationId);

                console.log(
                    "PAYMENT UPDATE ERROR:",
                    paymentUpdateError
                );



                onSuccess(consultationId);
            },

            prefill: {
                name: profile?.full_name || '',
                email: profile?.email || '',
                contact: profile?.phone?.toString() || '9999999999',
            },

            theme: {
                color: '#6366f1',
            },

            modal: {
                // ondismiss: () => {
                //     console.log('Payment cancelled');
                // },
                ondismiss: async () => {
                    console.log('Payment cancelled');

                    await supabase
                        .from('payments')
                        .update({
                            payment_status: 'failed',
                        })
                        .eq('razorpay_order_id', order_id);
                },
            },
        };

        // 3️⃣ 🔥 CRITICAL FIX (THIS IS WHY YOUR OLD CODE FAILED)

        // Close React modal FIRST (prevents overlay blocking Razorpay)
        if (closeModal) closeModal();

        // Restore body interaction
        document.body.style.overflow = 'auto';
        document.body.style.pointerEvents = 'auto';

        // Delay open so modal cleanup completes
        setTimeout(() => {
            const rzp = new window.Razorpay(options);
            rzp.open();
        }, 500);

    } catch (err: any) {
        console.error('Razorpay error:', err);
        onError(err.message || 'Payment failed');
    }
};