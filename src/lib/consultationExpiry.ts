import { supabase } from '@/integrations/supabase/client';

export const expireOldConsultations = async () => {
    try {
        // const { data: consultations } = await supabase
        //     .from('consultations')
        //     .select('id, started_at, duration_minutes, status')
        //     .eq('status', 'active');

        const { data: consultations } = await supabase
            .from('consultations')
            .select('id, lawyer_id, started_at, duration_minutes, status')
            .eq('status', 'active');
        if (!consultations) return;

        const now = Date.now();

        for (const consultation of consultations) {
            if (!consultation.started_at) continue;

            const endTime =
                new Date(consultation.started_at).getTime() +
                consultation.duration_minutes * 60 * 1000;

            if (now >= endTime) {
                // await supabase
                //     .from('consultations')
                //     .update({
                //         status: 'completed',
                //         ended_at: new Date().toISOString(),
                //     })
                //     .eq('id', consultation.id);
                await supabase
                    .from('consultations')
                    .update({
                        status: 'completed',
                        ended_at: new Date().toISOString(),
                    })
                    .eq('id', consultation.id);

                await supabase
                    .from('lawyer_profiles')
                    .update({
                        is_busy: false,
                        is_available: true,
                    })
                    .eq('user_id', consultation.lawyer_id);
            }
        }
    } catch (error) {
        console.error('Consultation expiry check failed:', error);
    }
};