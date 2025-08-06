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

  const handleZoneToggle = (zoneName: string) => {
    const zone = londonAreas.find(z => z.zone === zoneName);
    if (!zone) return;
    
    const allZoneAreasSelected = zone.areas.every(area => selectedLocations.includes(area));
    
    if (allZoneAreasSelected) {
      // Deselect all areas in this zone
      setSelectedLocations(prev => prev.filter(location => !zone.areas.includes(location)));
    } else {
      // Select all areas in this zone
      setSelectedLocations(prev => {
        const newSelections = [...prev];
        zone.areas.forEach(area => {
          if (!newSelections.includes(area)) {
            newSelections.push(area);
          }
        });
        return newSelections;
      });
    }
  };

  const isZoneFullySelected = (zoneName: string) => {
    const zone = londonAreas.find(z => z.zone === zoneName);
    if (!zone) return false;
    return zone.areas.every(area => selectedLocations.includes(area));
  };

  const isZonePartiallySelected = (zoneName: string) => {
    const zone = londonAreas.find(z => z.zone === zoneName);
    if (!zone) return false;
    return zone.areas.some(area => selectedLocations.includes(area)) && !isZoneFullySelected(zoneName);
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
    handleZoneToggle,
    isZoneFullySelected,
    isZonePartiallySelected,
    clearAllLocations,
    getSelectedLocationsByZone
  };
};