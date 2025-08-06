import { useState, useMemo } from 'react';
import { londonAreas, LondonArea } from '@/data/londonAreas';

export const useLocationSelector = (initialSelected: string[] = []) => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialSelected);
  const [locationSearch, setLocationSearch] = useState("");

  const filteredAreas = useMemo(() => {
    if (!locationSearch.trim()) return londonAreas;
    
    return londonAreas.map(zone => ({
      ...zone,
      areas: zone.areas.filter(area => 
        area.toLowerCase().includes(locationSearch.toLowerCase())
      )
    })).filter(zone => zone.areas.length > 0);
  }, [locationSearch]);

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const clearAllLocations = () => {
    setSelectedLocations([]);
  };

  const getSelectedLocationsByZone = () => {
    const selectedByZone: Record<string, string[]> = {};
    
    londonAreas.forEach(zone => {
      const selectedInZone = zone.areas.filter(area => selectedLocations.includes(area));
      if (selectedInZone.length > 0) {
        selectedByZone[zone.zone] = selectedInZone;
      }
    });
    
    return selectedByZone;
  };

  return {
    selectedLocations,
    setSelectedLocations,
    locationSearch,
    setLocationSearch,
    filteredAreas,
    handleLocationToggle,
    clearAllLocations,
    getSelectedLocationsByZone
  };
};