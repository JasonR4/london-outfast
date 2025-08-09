import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, X } from "lucide-react";
import { useLocationSelector } from "@/hooks/useLocationSelector";

interface LocationSelectorProps {
  selectedLocations: string[];
  onSelectionChange: (locations: string[]) => void;
  title?: string;
  description?: string;
  showSelectedSummary?: boolean;
  maxHeight?: string;
}

export const LocationSelector = ({ 
  selectedLocations, 
  onSelectionChange, 
  title = "London Areas",
  description = "Select the areas where you'd like to advertise",
  showSelectedSummary = true,
  maxHeight = "400px"
}: LocationSelectorProps) => {
  const {
    locationSearch,
    setLocationSearch,
    filteredAreas,
    handleLocationToggle: baseHandleLocationToggle,
    clearAllLocations: baseClearAllLocations,
    getSelectedLocationsByZone
  } = useLocationSelector(selectedLocations);

  const handleLocationToggle = (location: string) => {
    baseHandleLocationToggle(location);
    const newLocations = selectedLocations.includes(location) 
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location];
    onSelectionChange(newLocations);
  };

  const clearAllLocations = () => {
    baseClearAllLocations();
    onSelectionChange([]);
  };

  const selectedByZone = getSelectedLocationsByZone();

  const addAllAreas = () => {
    const allAreas = filteredAreas.flatMap(zone => zone.areas);
    onSelectionChange([...new Set([...selectedLocations, ...allAreas])]);
  };

  const addZoneAreas = (zoneAreas: string[]) => {
    const newAreas = [...new Set([...selectedLocations, ...zoneAreas])];
    onSelectionChange(newAreas);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {showSelectedSummary && selectedLocations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedLocations.length} area{selectedLocations.length !== 1 ? 's' : ''} selected
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllLocations}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
            
            <div className="space-y-1">
              {Object.entries(selectedByZone).map(([zone, areas]) => (
                <div key={zone} className="text-xs">
                  <span className="font-medium text-muted-foreground">{zone}:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {areas.map(area => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search London areas..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
           <div className="flex justify-between gap-2">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={clearAllLocations}
               className="h-7 px-3 text-xs"
               disabled={selectedLocations.length === 0}
             >
               Remove All Areas
             </Button>
             <Button 
               variant="outline" 
               size="sm" 
               onClick={addAllAreas}
               className="h-7 px-3 text-xs"
             >
               Add All Areas
             </Button>
           </div>
        </div>

        <ScrollArea className="rounded-md border" style={{ height: maxHeight }}>
          <div className="p-4 space-y-4">
            {filteredAreas.map((zone) => (
              <div key={zone.zone} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${zone.color}`} />
                    <h4 className="font-medium text-sm">{zone.zone}</h4>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => addZoneAreas(zone.areas)}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Add All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-2 ml-5">
                  {zone.areas.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${area}`}
                        checked={selectedLocations.includes(area)}
                        onCheckedChange={() => handleLocationToggle(area)}
                      />
                      <label
                        htmlFor={`location-${area}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};