import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Link2,
  DollarSign,
  FileText,
  Brain,
  Loader2
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  checkout_link: string | null;
  created_at: string;
  knowledge_count?: number;
}

const ProductsManager = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    checkout_link: ""
  });

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get knowledge chunk counts
      const productsWithKnowledge = await Promise.all(
        (data || []).map(async (product) => {
          const { count } = await supabase
            .from('knowledge_chunks')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', product.id);
          
          return { ...product, knowledge_count: count || 0 };
        })
      );

      setProducts(productsWithKnowledge);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          user_id: user?.id,
          name: formData.name,
          description: formData.description || null,
          price: formData.price ? parseFloat(formData.price) : null,
          checkout_link: formData.checkout_link || null
        });

      if (error) throw error;

      toast.success("Produto criado com sucesso!");
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", price: "", checkout_link: "" });
      loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error("Erro ao criar produto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto? Todo o conhecimento associado será perdido.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success("Produto excluído");
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error("Erro ao excluir produto");
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Meus Produtos
          </CardTitle>
          <CardDescription>
            Produtos que os agentes IA podem vender
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Produto</DialogTitle>
              <DialogDescription>
                Cadastre um produto para os agentes venderem
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Curso de Marketing Digital"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva brevemente o produto..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="997.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout_link">Link de Checkout</Label>
                  <Input
                    id="checkout_link"
                    placeholder="https://..."
                    value={formData.checkout_link}
                    onChange={(e) => setFormData({ ...formData, checkout_link: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={isSaving} 
                className="w-full gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Adicionar Produto
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Carregando...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Nenhum produto cadastrado
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Adicione produtos para os agentes começarem a vender
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{product.name}</h4>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        {product.price && (
                          <Badge variant="outline" className="gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {product.price.toLocaleString('pt-BR')}
                          </Badge>
                        )}
                        {product.checkout_link && (
                          <Badge variant="outline" className="gap-1 text-green-500 border-green-500/30">
                            <Link2 className="h-3 w-3" />
                            Checkout
                          </Badge>
                        )}
                        <Badge variant="outline" className="gap-1 text-primary border-primary/30">
                          <Brain className="h-3 w-3" />
                          {product.knowledge_count} chunks
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProductsManager;
