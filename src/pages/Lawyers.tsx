import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { LawyerCard } from '@/components/lawyers/LawyerCard';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { formatLawyerName } from '@/lib/lawyer-utils';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Users, X, Star, SlidersHorizontal, ChevronDown, ChevronUp, Globe, Briefcase, IndianRupee, ArrowLeft, TrendingUp, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import Consultation from './Consultation';

interface LawyerWithProfile {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  price_per_minute: number | null;
  rating: number | null;
  total_reviews: number | null;
  is_available: boolean | null;
  status: string | null;
  full_name?: string;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  total_consultations: number | null;
}
const SPECIALIZATION_OPTIONS = [
  'Criminal Law', 'Family Law', 'Corporate Law', 'Civil Law',
  'Tax Law', 'Labour Law', 'Property Law', 'Constitutional Law',
  'Cyber Law', 'Banking Law', 'Immigration Law', 'Environmental Law',
  'Intellectual Property', 'Consumer Protection',
];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi'];
const LAWYERS_PER_PAGE = 4;
const Lawyers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const sortParam = searchParams.get('sort');
  const filterParam = searchParams.get('filter');
  const [lawyers, setLawyers] = useState<LawyerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(filterParam === 'specialization');
  // const [busyLawyerIds, setBusyLawyerIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState(sortParam || 'default');
  useEffect(() => {
    if (sortParam) setSortBy(sortParam);
    if (filterParam === 'specialization') setShowFilters(true);
  }, [sortParam, filterParam]);

  useEffect(() => {
    fetchLawyers();
    // fetchBusyLawyers();
    const lawyerChannel = supabase
      .channel('lawyer-availability')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lawyer_profiles' }, () => fetchLawyers())
      .subscribe();
    // const consultationChannel = supabase
    //   .channel('consultation-status-changes')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => fetchBusyLawyers())
    //   .subscribe();
    return () => {
      supabase.removeChannel(lawyerChannel);
      // supabase.removeChannel(consultationChannel);
    };
  }, []);

  const fetchLawyers = async () => {
    const { data: lawyerData, error } = await supabase
      .from('lawyer_profiles')
      .select('*')
      // .order('is_available', { ascending: false })     // this will show both offline and online lawyers
      // .eq('is_available', true) // only available lawyers
      .eq('status', 'approved')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching lawyers:', error);
      setLoading(false);
      return;
    }

    if (lawyerData && lawyerData.length > 0) {
      const userIds = lawyerData.map(l => l.user_id);


      const { data: profilesData } = await supabase.from('profiles').select('id, full_name, avatar_url, date_of_birth').in('id', userIds);
      const enrichedLawyers = lawyerData.map(lawyer => {
        const profile = profilesData?.find(p => p.id === lawyer.user_id);

        return { ...lawyer, full_name: profile?.full_name || 'Legal Professional', avatar_url: profile?.avatar_url, date_of_birth: profile?.date_of_birth };
      });

      setLawyers(enrichedLawyers as LawyerWithProfile[]);
    } else {
      setLawyers([]);
    }
    setLoading(false);
  };

  // const fetchBusyLawyers = async () => {
  //   const { data } = await supabase
  //     .from('consultations')
  //     .select('lawyer_id')
  //     .in('status', ['active', 'paid']);
  //   if (data) {
  //     setBusyLawyerIds(new Set(data.map(c => c.lawyer_id)));
  //   }
  // };
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (minRating > 0) count++;
    if (minExperience > 0) count++;
    if (maxPrice < 100) count++;
    if (selectedSpecializations.length > 0) count++;
    if (selectedLanguages.length > 0) count++;
    if (onlineOnly) count++;
    if (categoryFilter) count++;
    return count;
  }, [minRating, minExperience, maxPrice, selectedSpecializations, selectedLanguages, onlineOnly, categoryFilter]);

  const filteredAndSortedLawyers = useMemo(() => {
    let result = lawyers.filter(lawyer => {
      const specializations = lawyer.specializations?.join(' ').toLowerCase() || '';
      const lawyerName = lawyer.full_name?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();


      const matchesSearch = !query || specializations.includes(query) || lawyerName.includes(query);
      const matchesCategory = !categoryFilter || lawyer.specializations?.some(s => s.toLowerCase().includes(categoryFilter.toLowerCase()));
      const matchesRating = !minRating || (lawyer.rating && lawyer.rating >= minRating);
      const matchesExperience = !minExperience || (lawyer.experience_years && lawyer.experience_years >= minExperience);
      const matchesPrice = (lawyer.price_per_minute ?? 0) <= maxPrice;
      const matchesOnline = !onlineOnly || lawyer.is_available;
      const matchesSpecializations = selectedSpecializations.length === 0 ||
        selectedSpecializations.some(s => lawyer.specializations?.some(ls => ls.toLowerCase().includes(s.toLowerCase())));
      const matchesLanguages = selectedLanguages.length === 0 ||
        selectedLanguages.some(l => lawyer.languages?.some(ll => ll.toLowerCase().includes(l.toLowerCase())));
      return matchesSearch && matchesCategory && matchesRating && matchesExperience && matchesPrice && matchesOnline && matchesSpecializations && matchesLanguages;
    });
    // Sort
    switch (sortBy) {
      case 'top-rated':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'experience':
        result.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
        break;
      case 'price-low':
        result.sort((a, b) => (a.price_per_minute || 0) - (b.price_per_minute || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price_per_minute || 0) - (a.price_per_minute || 0));
        break;
      case 'reviews':
        result.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
        break;
      default:
        // default: available first, then by rating
        break;
    }
    return result;
  }, [lawyers, searchQuery, categoryFilter, minRating, minExperience, maxPrice, selectedSpecializations, selectedLanguages, onlineOnly, sortBy]);
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, minRating, minExperience, maxPrice, selectedSpecializations, selectedLanguages, onlineOnly, sortBy]);
  const totalPages = Math.ceil(filteredAndSortedLawyers.length / LAWYERS_PER_PAGE);
  const paginatedLawyers = filteredAndSortedLawyers.slice(
    (currentPage - 1) * LAWYERS_PER_PAGE,
    currentPage * LAWYERS_PER_PAGE
  );
  const onlineLawyers = filteredAndSortedLawyers.filter(l => l.is_available);
  const clearAllFilters = () => {
    setSearchQuery('');
    setMinRating(0);
    setMinExperience(0);
    setMaxPrice(100);
    setSelectedSpecializations([]);
    setSelectedLanguages([]);
    setOnlineOnly(false);
    setSortBy('default');
    setSearchParams({});
  };
  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
  };
  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        {/* Hero Header */}
        <div className="relative bg-card border-b border-border overflow-hidden">
          {/* Decorative background elements */}

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
            {/* Title Row */}
            <div className="flex items-center sm:flex-row sm:items-center gap-4 mb-6 animate-fade-in">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shrink-0">
                <Users className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  {/* {sortBy === 'top-rated' ? 'Top Rated Lawyers' : 'Find a Lawyer'} */}
                  {sortBy === 'top-rated' ? 'Top Rated Lawyers' :
                    sortBy === 'experience' ? 'Most Experienced Lawyers' :
                      sortBy === 'price-low' ? 'Affordable Lawyers' :
                        sortBy === 'price-high' ? 'Premium Lawyers' :
                          sortBy === 'reviews' ? 'Most Reviewed Lawyers' :
                            'Find a Lawyer'
                  }
                </h1>
                <p className="text-muted-foreground text-sm md:text-base mt-1">
                  Verifird Lawyers • Instant Consultation • Available Now
                </p>

              </div>
            </div>



            {/* Search & Filter Controls */}
            <div className="flex flex-col gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <p className="text-muted-foreground text-sm md:text-base mt-1 max-w-2xl">
                  Search and connect with verified lawyers available for instant consultation.
                  Filter by specialization, ratings, and experience to find the right legal expert.
                </p>
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base bg-background border-border focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 h-12">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="top-rated">Top Rated</SelectItem>
                      <SelectItem value="experience">Most Experienced</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    size="lg"
                    className="gap-2 h-12 shrink-0 transition-all duration-200"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden xs:inline">Filters</span>
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                        {activeFilterCount}
                      </Badge>
                    )}
                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>


            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-6 p-4 md:p-6 bg-background border border-border rounded-xl animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Advanced Filters
                  </h3>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs text-muted-foreground">
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                  {/* Rating Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" /> Minimum Rating
                    </Label>
                    <div className="flex items-center gap-3">
                      <Slider value={[minRating]} onValueChange={([val]) => setMinRating(val)} max={5} step={0.5} className="flex-1" />
                      <span className="text-sm font-medium w-8 text-center">{minRating > 0 ? `${minRating}+` : 'Any'}</span>
                    </div>
                  </div>

                  {/* Experience Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-500" /> Min. Experience (years)
                    </Label>
                    <div className="flex items-center gap-3">
                      <Slider value={[minExperience]} onValueChange={([val]) => setMinExperience(val)} max={30} step={1} className="flex-1" />
                      <span className="text-sm font-medium w-8 text-center">{minExperience > 0 ? `${minExperience}+` : 'Any'}</span>
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-emerald-500" /> Max Price/min
                    </Label>
                    <div className="flex items-center gap-3">
                      <Slider value={[minExperience]} onValueChange={([val]) => setMinExperience(val)} max={30} step={1} className="flex-1" />
                      <span className="text-sm font-medium w-12 text-center">₹{maxPrice}</span>
                    </div>
                  </div>
                  {/* Online Only Toggle */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Availability</Label>
                    <div className="flex items-center gap-3">
                      <Switch checked={onlineOnly} onCheckedChange={setOnlineOnly} />
                      <span className="text-sm text-muted-foreground">Online only</span>
                    </div>
                  </div>
                </div>
                {/* Specializations */}
                <div className="mt-6 space-y-3">
                  <Label className="text-sm font-medium">Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATION_OPTIONS.map(spec => (
                      <Badge
                        key={spec}
                        variant={selectedSpecializations.includes(spec) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10 transition-all duration-200 text-xs py-1.5 select-none"
                        onClick={() => toggleSpecialization(spec)}
                      >
                        {spec}
                        {selectedSpecializations.includes(spec) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
                {/* Languages */}
                <div className="mt-4 space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Languages
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map(lang => (
                      <Badge
                        key={lang}
                        variant={selectedLanguages.includes(lang) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10 transition-all duration-200 text-xs py-1.5 select-none"
                        onClick={() => toggleLanguage(lang)}
                      >
                        {lang}
                        {selectedLanguages.includes(lang) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Active Filter Badges */}
            {(categoryFilter || activeFilterCount > 0) && !showFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2 animate-fade-in">
                <span className="text-sm text-muted-foreground">Active:</span>
                {categoryFilter && (
                  <Badge variant="secondary" className="gap-1.5 pr-1.5">
                    {categoryFilter}
                    <button onClick={() => setSearchParams({})} className="ml-1 hover:bg-muted rounded-full p-0.5"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {sortBy !== 'default' && (
                  <Badge variant="secondary" className="gap-1.5 pr-1.5">
                    Sort: {sortBy.replace('-', ' ')}
                    <button onClick={() => setSortBy('default')} className="ml-1 hover:bg-muted rounded-full p-0.5"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
                {minRating > 0 && <Badge variant="secondary">Rating: {minRating}+</Badge>}
                {minExperience > 0 && <Badge variant="secondary">Exp: {minExperience}+ yrs</Badge>}
                {onlineOnly && <Badge variant="secondary">Online only</Badge>}
                {selectedSpecializations.length > 0 && <Badge variant="secondary">{selectedSpecializations.length} specializations</Badge>}
                {selectedLanguages.length > 0 && <Badge variant="secondary">{selectedLanguages.length} languages</Badge>}
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearAllFilters}>Clear all</Button>
              </div>
            )}
          </div>
        </div>

        {/* Lawyers Grid */}

        <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                  <div className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-20 h-20 rounded-2xl" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-full mt-4" />
                    <Skeleton className="h-16 w-full mt-4" />
                  </div>
                  <div className="p-6 bg-secondary/30 border-t border-border">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedLawyers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No Lawyers Found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters to find legal professionals</p>
              <Button variant="outline" onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
          ) : (
            <>
              {/* Online Lawyers Section */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 items-stretch">
                {paginatedLawyers.map((lawyer, i) => (
                  <div
                    key={lawyer.id}
                    className="animate-scale-in h-full flex"
                    style={{
                      animationDelay: `${i * 0.06}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="w-full h-full flex">
                      <LawyerCard
                        lawyer={lawyer}
                      // isBusy={busyLawyerIds.has(lawyer.user_id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 md:mt-12 animate-fade-in">

                  <div className="flex flex-col items-center justify-center gap-6">
                    {/* Page info */}

                    <p className="text-sm text-muted-foreground text-center">
                      Showing {(currentPage - 1) * LAWYERS_PER_PAGE + 1}–{Math.min(currentPage * LAWYERS_PER_PAGE, filteredAndSortedLawyers.length)} of {filteredAndSortedLawyers.length} lawyers
                    </p>
                    {/* Pagination controls */}
                    <nav
                      className="flex flex-wrap items-center justify-center gap-2"
                      aria-label="Pagination"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="gap-1 h-9 px-3 text-xs sm:text-sm"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, idx) =>
                          page === 'ellipsis' ? (
                            <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm">
                              …
                            </span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className={`w-9 h-9 p-0 text-xs sm:text-sm ${currentPage === page ? 'pointer-events-none' : ''}`}
                            >
                              {page}
                            </Button>
                          )
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="gap-1 h-9 px-3 text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </nav>

                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default Lawyers;
