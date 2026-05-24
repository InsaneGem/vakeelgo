export const rejectButtonStyle = [
    "flex-1",
    "h-11",
    "sm:h-12",
    "rounded-xl",
    "gap-2",

    "bg-red-50",
    "border",
    "border-red-200",
    "text-red-700",

    "hover:bg-red-100",
    "hover:border-red-300",
    "hover:text-red-800",

    "active:bg-red-200",

    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-red-500",
    "focus:ring-offset-2",

    "transition-all",
    "duration-200",
].join(" ");

export const acceptButtonStyle = [
    "flex-1",
    "h-11",
    "sm:h-12",
    "rounded-xl",
    "gap-2",

    "border-gray-300",

    "font-medium",

    "transition-all",
    "duration-200",

    "bg-gradient-to-r",
    "from-green-600",
    "to-green-500",

    "hover:from-green-500",
    "hover:to-green-600",

    "text-white",

    "shadow-lg",
    "hover:shadow-xl",

    "active:scale-[0.98]",

    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-green-500",
    "focus:ring-offset-2",
].join(" ");


export const bookNowButtonStyle = [
    "h-9",
    "sm:h-9",
    "rounded-xl",
    "gap-2",

    "font-semibold",

    "transition-all",
    "duration-200",

    // Premium light blue using #00B4FF
    "bg-[#00B4FF]",

    // KEEP SAME COLOR ON HOVER
    "hover:bg-[#00B4FF]",

    // Dark readable text
    "text-white",
    "hover:text-white",

    // Premium shadow
    "shadow-md",
    "hover:shadow-lg",

    // ONLY slight front movement
    "hover:-translate-y-0.5",

    // NO brightness/color change
    "hover:brightness-100",

    // Border
    "border",
    "border-[#00B4FF]",

    // Focus
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-[#00B4FF]",
    "focus:ring-offset-2",
].join(" ");



export const seeMoreButtonStyle = [
    "h-9",
    "sm:h-9",
    "rounded-xl",
    "gap-2",

    "font-semibold",

    "transition-all",
    "duration-200",

    // Premium soft pink-purple background
    "bg-gradient-to-r",
    "from-[#F2CCFF]",
    "via-[#F7D9FF]",
    "to-[#EFC2FF]",

    // KEEP SAME COLORS ON HOVER
    "hover:from-[#F2CCFF]",
    "hover:via-[#F7D9FF]",
    "hover:to-[#EFC2FF]",

    // Dark premium text
    "text-purple-900",
    "hover:text-purple-900",

    // Premium shadow
    "shadow-md",
    "hover:shadow-lg",

    // ONLY slight front movement
    "hover:-translate-y-0.5",

    // NO brightness/color change
    "hover:brightness-100",

    "active:scale-[0.98]",

    "border",
    "border-[#E5B8F4]",

    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-[#F2CCFF]",
    "focus:ring-offset-2",
].join(" ");




export const lawyerCardStyle = [

    "relative rounded-lg border overflow-hidden",
    "flex flex-col h-full min-h-[205px]",
    "cursor-pointer",
    "mt-2",

    // Premium golden background
    "bg-gradient-to-r",
    "from-amber-200",
    "via-yellow-200",
    "to-amber-300",

    // KEEP SAME COLORS ON HOVER
    "hover:from-amber-200",
    "hover:via-yellow-200",
    "hover:to-amber-300",

    // Dark premium text
    "text-amber-900",
    "hover:text-amber-900",

    // Premium shadow
    "shadow-md",
    "hover:shadow-lg",

    // ONLY slight front movement
    "hover:-translate-y-1",
    "hover:scale-[1.01]",

    // NO brightness/color change
    "hover:brightness-100",

    "border-amber-300/40",

    "transition-all",
    "duration-300",
    "ease-out",

].join(" ");


// export const smallCardStyle = [
//     "rounded-2xl",
//     "border",

//     // Premium luxury lavender background
//     "bg-gradient-to-br",
//     "from-[#D6B4D6]",
//     "via-[#DDBFDD]",
//     "to-[#CFA9CF]",

//     // Keep same colors on hover
//     "hover:from-[#D6B4D6]",
//     "hover:via-[#DDBFDD]",
//     "hover:to-[#CFA9CF]",

//     // Rich black text
//     "text-black",
//     "hover:text-black",

//     // Premium glass/shadow effect
//     "shadow-lg",
//     "hover:shadow-2xl",

//     // Elegant border
//     "border-white/40",

//     // Smooth premium movement
//     "hover:-translate-y-1",
//     "hover:scale-[1.01]",

//     // Prevent brightness/color change
//     "hover:brightness-100",

//     // Smooth animation
//     "transition-all",
//     "duration-300",
//     "ease-out",

//     // Optional subtle backdrop feel
//     "backdrop-blur-sm",
// ].join(" ");


export const transactionCardStyle = [
    "rounded-2xl",
    "border",

    // Black background
    "bg-black",

    // Keep same black background on hover
    "hover:bg-black",

    // White text
    "text-white",
    "hover:text-white",

    // Premium glass/shadow effect
    "shadow-lg",
    "hover:shadow-2xl",

    // Elegant border
    "border-white/40",

    // Smooth premium movement
    "hover:-translate-y-1",
    "hover:scale-[1.01]",

    // Prevent brightness/color change
    "hover:brightness-100",

    // Smooth animation
    "transition-all",
    "duration-300",
    "ease-out",

    // Optional subtle backdrop feel
    "backdrop-blur-sm",
].join(" ");

// export const smallCardStyle = [
//     "rounded-2xl",
//     "border-2", // Increased thickness slightly to make the frame pop like the demo

//     // Premium luxury matte orchid background (Matches the demo color exactly)
//     "bg-gradient-to-br",
//     "from-[#EADFFF]",
//     "to-[#DFCEFF]",

//     // Maintain stable background colors on hover
//     "hover:from-[#EADFFF]",
//     "hover:to-[#DFCEFF]",

//     // Deep premium contrast purple text (CRITICAL: Fixes your washed-out text)
//     "text-[#1F123D]",
//     "hover:text-[#1F123D]",

//     /* 
//       DEMO GLOW ENGINE:
//       Matches the explicit, rich ambient shadow lifting off the white backdrop in the image.
//     */
//     "shadow-[0_12px_30px_rgba(108,92,231,0.18),_0_0_0_1px_rgba(108,92,231,0.05)]",
//     "hover:shadow-[0_20px_40px_rgba(108,92,231,0.28),_0_0_0_1px_rgba(108,92,231,0.1)]",

//     /*
//       DEMO BORDER COLOR:
//       A solid, distinct purple frame that defines the shape cleanly against the white background.
//     */
//     "border-[#9F85F8]",
//     "hover:border-[#8A66F6]",

//     // Smooth premium movement
//     "hover:-translate-y-1",
//     "hover:scale-[1.01]",

//     // Prevent brightness/color change
//     "hover:brightness-100",

//     // Smooth animation
//     "transition-all",
//     "duration-300",
//     "ease-out",

//     // Optional subtle backdrop feel
//     "backdrop-blur-sm",
// ].join(" ");


// export const smallCardStyle = [
//     "rounded-2xl",
//     "border",

//     // Premium luxury matte orchid background
//     "bg-gradient-to-br",
//     "from-[#EADFFF]",
//     "to-[#DFCEFF]",

//     // Maintain stable background colors on hover
//     "hover:from-[#EADFFF]",
//     "hover:to-[#DFCEFF]",

//     // Deep premium contrast purple text
//     "text-[#1F123D]",
//     "hover:text-[#1F123D]",

//     /* 
//       GLOW ENGINE CHANGE: 
//       Replaced standard shadows with dual-purpose ambient shadow strings.
//       This creates a tight, intense colored glow around the 1px border perimeter.
//     */
//     "shadow-[0_0_15px_rgba(108,92,231,0.25),_0_8px_25px_rgba(108,92,231,0.07)]",
//     "hover:shadow-[0_0_25px_rgba(108,92,231,0.45),_0_15px_30px_rgba(108,92,231,0.15)]",

//     /*
//       BORDER LAYER CHANGE:
//       Switched to a semi-transparent white-purple border. 
//       This lets the glow look like it is emitting straight out from the edge.
//     */
//     "border-white/60",
//     "hover:border-white/90",

//     // Smooth premium movement
//     "hover:-translate-y-1",
//     "hover:scale-[1.01]",

//     // Prevent brightness/color change
//     "hover:brightness-100",

//     // Smooth animation
//     "transition-all",
//     "duration-300",
//     "ease-out",

//     // Optional subtle backdrop feel
//     "backdrop-blur-sm",
// ].join(" ");


export const smallCardStyle = [
    "rounded-2xl",
    "border",

    // Premium luxury matte orchid background (Option 3 style from image)
    "bg-gradient-to-br",
    "from-[#EADFFF]",
    "to-[#DFCEFF]",

    // Maintain stable background colors on hover
    "hover:from-[#EADFFF]",
    "hover:to-[#DFCEFF]",

    // Deep premium contrast purple text (Matches the high-end imagery)
    "text-[#1F123D]",
    "hover:text-[#1F123D]",

    // Soft multi-layered premium shadow depth
    "shadow-[0_8px_25px_rgba(108,92,231,0.07)]",
    "hover:shadow-[0_15px_30px_rgba(108,92,231,0.12)]",

    // Crisp premium solid-tint border rule
    "border-[rgba(108,92,231,0.25)]",

    // Smooth premium movement
    "hover:-translate-y-1",
    "hover:scale-[1.01]",

    // Prevent brightness/color change
    "hover:brightness-100",

    // Smooth animation
    "transition-all",
    "duration-300",
    "ease-out",

    // Optional subtle backdrop feel
    "backdrop-blur-sm",
].join(" ");