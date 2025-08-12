import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCentralizedMediaFormats } from "@/hooks/useCentralizedMediaFormats";
import { useMediaFormatsContext } from "@/components/providers/MediaFormatsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Search } from "lucide-react";

const FormatDirectory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { mediaFormats, loading, refetch } = useCentralizedMediaFormats();
  const { mediaFormats: ctxFormats, service } = useMediaFormatsContext();

  const combinedFormats = mediaFormats.length ? mediaFormats : ctxFormats;
  
  useEffect(() => {
    refetch();
    if (combinedFormats.length === 0) {
      // Trigger a service refresh as a fallback
      service.fetchFormats(false).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Get unique format categories from CMS categories
  const categories = Array.from(
    new Set(
      combinedFormats.flatMap((format) => format.categories?.location ?? [])
    )
  ).filter(Boolean).sort();
  
  const filteredFormats = combinedFormats.filter((format) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = format.format_name.toLowerCase().includes(q);
    const descMatch = (format.description || '').toLowerCase().includes(q);
    const categoryTexts = [
      ...(format.categories?.format ?? []),
      ...(format.categories?.location ?? []),
    ].map((c) => c.toLowerCase());
    const categorySearchMatch = q ? categoryTexts.some((c) => c.includes(q)) : true;
    const matchesSearch = nameMatch || descMatch || categorySearchMatch;

    const matchesCategory =
      selectedCategory === 'all' || (format.categories?.format ?? []).includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });
  
  const handleFormatClick = (slug: string) => {
    navigate(`/outdoor-media/${slug}`);
  };

  const handleGetQuote = () => {
    navigate("/quote");
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            OOH FORMAT DIRECTORY
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            London OOH Formats & Rates
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Explore all available Out-of-Home advertising formats across London. From digital billboards to underground panels, find the perfect format for your campaign.
          </p>
          <Button onClick={handleGetQuote} size="lg" className="bg-gradient-primary hover:opacity-90">
            Get Custom Quote for Any Format
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search formats, categories, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground">
              Showing {filteredFormats.length} of {combinedFormats.length} formats
            </p>
          </div>
        </div>
      </section>

      {/* Format Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFormats.map((format) => (
              <Card key={format.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleFormatClick(format.format_slug)}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {format.dimensions || 'Various Sizes'}
                    </Badge>
                    <Badge variant="secondary">
                      OOH Format
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {format.format_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {format.description || 'Professional outdoor advertising format available across London.'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {format.dimensions && (
                      <div className="text-xs">
                        <span className="font-medium">Size:</span> {format.dimensions}
                      </div>
                    )}
                    <div className="text-xs">
                      <span className="font-medium">Format:</span> {format.format_name}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Status:</span> {format.is_active ? 'Available' : 'Unavailable'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button asChild variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Link to={`/outdoor-media/${format.format_slug}`}>
                        Learn More
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredFormats.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No formats found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filter criteria
              </p>
              <Button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">{combinedFormats.length}+</div>
                <h3 className="font-semibold">Format Types</h3>
                <p className="text-sm text-muted-foreground">Available across London</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">32</div>
                <h3 className="font-semibold">London Boroughs</h3>
                <p className="text-sm text-muted-foreground">Complete coverage</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">24h</div>
                <h3 className="font-semibold">Quote Turnaround</h3>
                <p className="text-sm text-muted-foreground">Same-day response</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <h3 className="font-semibold">Price Guarantee</h3>
                <p className="text-sm text-muted-foreground">Best rates in London</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need Help Choosing the Right Format?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our OOH experts can recommend the perfect format mix for your campaign objectives and budget
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetQuote} size="lg" className="bg-gradient-primary hover:opacity-90">
              GET EXPERT CONSULTATION
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = "tel:+442045243019"}>
              CALL: +44 204 524 3019
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default FormatDirectory;