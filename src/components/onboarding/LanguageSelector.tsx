// import { Badge } from '@/components/ui/badge';
// import { cn } from '@/lib/utils';
// import { X, Plus, Globe } from 'lucide-react';
// const LANGUAGE_OPTIONS = [
//   { code: 'en', label: 'English', flag: '🇺🇸' },
//   { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
//   { code: 'es', label: 'Spanish', flag: '🇪🇸' },
//   { code: 'fr', label: 'French', flag: '🇫🇷' },
//   { code: 'de', label: 'German', flag: '🇩🇪' },
//   { code: 'zh', label: 'Mandarin', flag: '🇨🇳' },
//   { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
//   { code: 'pt', label: 'Portuguese', flag: '🇧🇷' },
//   { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
//   { code: 'ko', label: 'Korean', flag: '🇰🇷' },
//   { code: 'ru', label: 'Russian', flag: '🇷🇺' },
//   { code: 'it', label: 'Italian', flag: '🇮🇹' },
// ];
// interface LanguageSelectorProps {
//   selected: string[];
//   onChange: (selected: string[]) => void;
// }
// export const LanguageSelector = ({
//   selected,
//   onChange,
// }: LanguageSelectorProps) => {
//   const toggleLanguage = (label: string) => {
//     if (selected.includes(label)) {
//       // Don't allow removing last language
//       if (selected.length > 1) {
//         onChange(selected.filter(l => l !== label));
//       }
//     } else {
//       onChange([...selected, label]);
//     }
//   };
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center gap-2 text-sm text-muted-foreground">
//         <Globe className="h-4 w-4" />
//         <p>Select languages you can consult in</p>
//       </div>

//       <div className="flex flex-wrap gap-2">
//         {LANGUAGE_OPTIONS.map((lang) => {
//           const isSelected = selected.includes(lang.label);

//           return (
//             <Badge
//               key={lang.code}
//               variant={isSelected ? 'default' : 'outline'}
//               className={cn(
//                 // 🔥 COMPACT STYLE
//                 "cursor-pointer px-2.5 py-1 text-[11px] sm:text-xs rounded-md flex items-center gap-1.5",
//                 "transition-all duration-200",

//                 "hover:bg-primary/10 hover:border-primary",

//                 isSelected && "bg-primary text-white border-primary"
//               )}
//               onClick={() => toggleLanguage(lang.label)}
//             >
//               <span className="text-sm">{lang.flag}</span>

//               {/* truncate for mobile */}
//               <span className="truncate max-w-[80px] sm:max-w-none">
//                 {lang.label}
//               </span>

//               {isSelected ? (
//                 <X className="h-3 w-3" />
//               ) : (
//                 <Plus className="h-3 w-3" />
//               )}
//             </Badge>
//           );
//         })}
//       </div>

//       {selected.length > 0 && (
//         <p className="text-xs text-muted-foreground">
//           {selected.length} language{selected.length > 1 ? 's' : ''} selected
//         </p>
//       )}
//     </div>
//   );
// };

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X, Plus, Globe } from 'lucide-react';

// Updated with major regional and official Indian languages
const LANGUAGE_OPTIONS = [
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'en', label: 'English', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳' },
  { code: 'ur', label: 'Urdu', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi', flag: '🇮🇳' },
  { code: 'or', label: 'Odia', flag: '🇮🇳' },
  { code: 'as', label: 'Assamese', flag: '🇮🇳' },
];

interface LanguageSelectorProps {
  // Array of language codes now (e.g., ['hi', 'en'])
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const LanguageSelector = ({
  selected,
  onChange,
}: LanguageSelectorProps) => {
  const toggleLanguage = (code: string) => {
    if (selected.includes(code)) {
      // Don't allow removing last language
      if (selected.length > 1) {
        onChange(selected.filter(c => c !== code));
      }
    } else {
      onChange([...selected, code]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Globe className="h-4 w-4" />
        <p>Select languages you can consult in</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LANGUAGE_OPTIONS.map((lang) => {
          // Checking matching code instead of label
          const isSelected = selected.includes(lang.code);

          return (
            <Badge
              key={lang.code}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer px-2.5 py-1 text-[11px] sm:text-xs rounded-md flex items-center gap-1.5",
                "transition-all duration-200",
                "hover:bg-primary/10 hover:border-primary",
                isSelected && "bg-primary text-white border-primary"
              )}
              onClick={() => toggleLanguage(lang.code)}
            >
              <span className="text-sm">{lang.flag}</span>

              {/* Truncate for mobile viewports */}
              <span className="truncate max-w-[80px] sm:max-w-none">
                {lang.label}
              </span>

              {isSelected ? (
                <X className="h-3 w-3" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Badge>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} language{selected.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};