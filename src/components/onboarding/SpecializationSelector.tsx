// import { Badge } from '@/components/ui/badge';
// import { cn } from '@/lib/utils';
// import { X, Plus } from 'lucide-react';
// const SPECIALIZATION_OPTIONS = [
//   { id: 'criminal', label: 'Criminal Law', icon: '⚖️' },
//   { id: 'family', label: 'Family Law', icon: '👨‍👩‍👧‍👦' },
//   { id: 'corporate', label: 'Corporate Law', icon: '🏢' },
//   { id: 'civil', label: 'Civil Law', icon: '📋' },
//   { id: 'real-estate', label: 'Real Estate', icon: '🏠' },
//   { id: 'immigration', label: 'Immigration', icon: '🌍' },
//   { id: 'tax', label: 'Tax Law', icon: '💰' },
//   { id: 'ip', label: 'Intellectual Property', icon: '💡' },
//   { id: 'labor', label: 'Labor Law', icon: '👷' },
//   { id: 'environmental', label: 'Environmental Law', icon: '🌿' },
//   { id: 'consumer', label: 'Consumer Law', icon: '🛒' },
//   { id: 'banking', label: 'Banking Law', icon: '🏦' },
//   { id: 'cyber', label: 'Cyber Law', icon: '💻' },
//   { id: 'constitutional', label: 'Constitutional Law', icon: '📜' },
// ];
// interface SpecializationSelectorProps {
//   selected: string[];
//   onChange: (selected: string[]) => void;
//   maxSelections?: number;
// }
// export const SpecializationSelector = ({
//   selected,
//   onChange,
//   maxSelections = 5,
// }: SpecializationSelectorProps) => {
//   const toggleSpecialization = (label: string) => {
//     if (selected.includes(label)) {
//       onChange(selected.filter(s => s !== label));
//     } else if (selected.length < maxSelections) {
//       onChange([...selected, label]);
//     }
//   };
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-muted-foreground">
//           Select up to {maxSelections} specializations
//         </p>
//         <Badge variant="outline" className={cn(
//           selected.length === 0 && "text-amber-600 border-amber-500/30"
//         )}>
//           {selected.length}/{maxSelections} selected
//         </Badge>
//       </div>

//       <div className="flex flex-wrap gap-2">
//         {SPECIALIZATION_OPTIONS.map((spec) => {
//           const isSelected = selected.includes(spec.label);
//           const isDisabled = !isSelected && selected.length >= maxSelections;

//           return (
//             <Badge
//               key={spec.id}
//               variant={isSelected ? 'default' : 'outline'}
//               className={cn(
//                 "cursor-pointer px-2.5 py-1 text-xs rounded-full h-auto whitespace-nowrap",
//                 "transition-all duration-200",
//                 "hover:scale-[1.03] active:scale-[0.97]",

//                 isSelected && "bg-primary text-white border-primary shadow-sm",
//                 isDisabled && "opacity-40 cursor-not-allowed hover:scale-100",
//                 !isSelected && !isDisabled && "text-muted-foreground hover:bg-muted"
//               )}
//               onClick={() => !isDisabled && toggleSpecialization(spec.label)}
//             >
//               <span className="mr-1">{spec.icon}</span>
//               {spec.label}
//               {isSelected ? (
//                 <X className="h-3 w-3 ml-1.5" />
//               ) : (
//                 <Plus className="h-3 w-3 ml-1.5" />
//               )}
//             </Badge>
//           );
//         })}
//       </div>

//       {selected.length === 0 && (
//         <p className="text-xs text-amber-600 flex items-center gap-1">
//           Please select at least one specialization
//         </p>
//       )}
//     </div>
//   );
// };


import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X, Plus } from 'lucide-react';

// Tailored for the most common legal practices in Indian District Courts, High Courts, and Tribunals
const SPECIALIZATION_OPTIONS = [
  { id: 'Civil Law', label: 'Civil Litigation', icon: '📋' },
  { id: 'Criminal Law', label: 'Criminal Law', icon: '⚖️' },
  { id: 'Family Law', label: 'Family & Matrimonial Law', icon: '👨‍👩‍👧‍👦' },
  { id: 'Corporate Law', label: 'Corporate & Commercial', icon: '🏢' },
  { id: 'Property Law', label: 'Property & Real Estate (RERA)', icon: '🏠' },
  { id: 'NI Act Law', label: 'Cheque Bounce (Sec 138 NI Act)', icon: '💸' },
  { id: 'MACT Law', label: 'Motor Accident Claims (MACT)', icon: '🚗' },
  { id: 'Banking Law', label: 'Banking & Debt Recovery (DRT)', icon: '🏦' },
  { id: 'Labor Law', label: 'Labor & Service Law', icon: '👷' },
  { id: 'Consumer Law', label: 'Consumer Disputes (NCDRC)', icon: '🛒' },
  { id: 'Arbitration Law', label: 'Arbitration & ADR', icon: '🤝' },
  { id: 'Taxation Law', label: 'Taxation (Direct & GST)', icon: '💰' },
  { id: 'Cyber & IT Law', label: 'Cyber & IT Law', icon: '💻' },
  { id: 'Constitutional Law', label: 'Constitutional & Writ Matters', icon: '📜' },
  { id: 'Intellectual Property Law', label: 'Intellectual Property (IPR)', icon: '💡' },
  { id: 'Insolvency Law', label: 'Insolvency & Bankruptcy (NCLT)', icon: '📉' },
  { id: 'Real Estate Law', label: 'Real Estate Regulatory Authority (RERA)', icon: '🏗️' },
  { id: 'Immigration Law', label: 'Immigration Law', icon: '🌍' },
  { id: 'Others Law', label: 'Others', icon: '📁' },
];

interface SpecializationSelectorProps {
  // Array of IDs now (e.g., ['civil', 'criminal'])
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
}

export const SpecializationSelector = ({
  selected,
  onChange,
  maxSelections = 8, // Default updated to 8
}: SpecializationSelectorProps) => {
  const toggleSpecialization = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else if (selected.length < maxSelections) {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Select up to {maxSelections} specializations
        </p>
        <Badge variant="outline" className={cn(
          selected.length === 0 && "text-amber-600 border-amber-500/30"
        )}>
          {selected.length}/{maxSelections} selected
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {SPECIALIZATION_OPTIONS.map((spec) => {
          // Changed matching rule to use 'id' instead of 'label'
          const isSelected = selected.includes(spec.id);
          const isDisabled = !isSelected && selected.length >= maxSelections;

          return (
            <Badge
              key={spec.id}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer px-2.5 py-1 text-xs rounded-full h-auto whitespace-nowrap",
                "transition-all duration-200",
                "hover:scale-[1.03] active:scale-[0.97]",

                isSelected && "bg-primary text-white border-primary shadow-sm",
                isDisabled && "opacity-40 cursor-not-allowed hover:scale-100",
                !isSelected && !isDisabled && "text-muted-foreground hover:bg-muted"
              )}
              onClick={() => !isDisabled && toggleSpecialization(spec.id)}
            >
              <span className="mr-1">{spec.icon}</span>
              {spec.label}
              {isSelected ? (
                <X className="h-3 w-3 ml-1.5" />
              ) : (
                <Plus className="h-3 w-3 ml-1.5" />
              )}
            </Badge>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          Please select at least one specialization
        </p>
      )}
    </div>
  );
};