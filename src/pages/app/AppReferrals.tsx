import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Link, QrCode, Download, Globe, Check, Share2, Plus, Trash2, Edit2, MoreVertical, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useReferralLinks, useCreateReferralLink, useUpdateReferralLink, useDeleteReferralLink } from '@/hooks/useReferralLinks';
import { toast } from 'sonner';
import type { ReferralLink } from '@/lib/firebase-types';

const countries = [
  { code: 'all', name: 'Todos los países', flag: '🌎' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
];

const AppReferrals = () => {
  const { userData } = useFirebaseAuth();
  const { data: referralLinks, isLoading } = useReferralLinks(userData?.uid || null);
  const createLink = useCreateReferralLink();
  const updateLink = useUpdateReferralLink();
  const deleteLink = useDeleteReferralLink();

  const [selectedQRLink, setSelectedQRLink] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ReferralLink | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    country: 'all',
    whatsappOverride: '',
    contactLabelOverride: '',
    messageTemplate: '',
    isActive: true,
  });

  const baseUrl = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
  
  const buildLink = (linkId?: string, country?: string) => {
    if (!userData?.refCode) return '';
    
    let link = `${baseUrl}/?ref=${userData.refCode}`;
    
    if (linkId) {
      link += `&cid=${linkId}`;
    }
    
    if (country && country !== 'all') {
      link += `&country=${country}`;
    }
    
    return link;
  };

  const mainLink = buildLink();

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    toast.success('Link copiado');
  };

  const downloadQR = (linkId: string) => {
    const svg = document.querySelector(`#qr-${linkId} svg`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${linkId}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('QR descargado');
    }
  };

  const shareWhatsApp = (link: string, template?: string) => {
    const text = template || `¡Únete a Ganaya.bet! Casino online con atención personalizada. Regístrate aquí: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text.includes('{link}') ? text.replace('{link}', link) : text + ' ' + link)}`, '_blank');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: 'all',
      whatsappOverride: '',
      contactLabelOverride: '',
      messageTemplate: '',
      isActive: true,
    });
  };

  const handleCreate = async () => {
    if (!userData?.uid || !formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      await createLink.mutateAsync({
        agentUid: userData.uid,
        name: formData.name.trim(),
        country: formData.country === 'all' ? null : formData.country,
        whatsappOverride: formData.whatsappOverride || null,
        contactLabelOverride: formData.contactLabelOverride || null,
        messageTemplate: formData.messageTemplate || null,
        isActive: formData.isActive,
      });
      toast.success('Link creado');
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error al crear el link');
    }
  };

  const handleUpdate = async () => {
    if (!editingLink || !userData?.uid) return;

    try {
      await updateLink.mutateAsync({
        id: editingLink.id,
        agentUid: userData.uid,
        data: {
          name: formData.name.trim(),
          country: formData.country === 'all' ? null : formData.country,
          whatsappOverride: formData.whatsappOverride || null,
          contactLabelOverride: formData.contactLabelOverride || null,
          messageTemplate: formData.messageTemplate || null,
          isActive: formData.isActive,
        },
      });
      toast.success('Link actualizado');
      setEditingLink(null);
      resetForm();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (link: ReferralLink) => {
    if (!userData?.uid) return;
    
    if (!confirm(`¿Eliminar el link "${link.name}"?`)) return;

    try {
      await deleteLink.mutateAsync({ id: link.id, agentUid: userData.uid });
      toast.success('Link eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const startEdit = (link: ReferralLink) => {
    setFormData({
      name: link.name,
      country: link.country || 'all',
      whatsappOverride: link.whatsappOverride || '',
      contactLabelOverride: link.contactLabelOverride || '',
      messageTemplate: link.messageTemplate || '',
      isActive: link.isActive,
    });
    setEditingLink(link);
  };

  if (!userData?.refCode) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="glass-card max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No tienes un código de referido asignado. Contacta a un administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Mis Links</h1>
          <p className="text-muted-foreground">Crea y gestiona links con WhatsApp personalizado</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Crear Link
        </Button>
      </div>

      {/* Main Ref Code Card */}
      <Card className="glass-card border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            Link Principal
          </CardTitle>
          <CardDescription>Tu link base con contacto por defecto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
            <p className="text-sm text-muted-foreground mb-1">Tu código</p>
            <code className="text-2xl font-bold text-primary">{userData.refCode}</code>
          </div>

          <div className="flex gap-2">
            <Input value={mainLink} readOnly className="font-mono text-xs" />
            <Button onClick={() => copyLink(mainLink)} variant="outline" size="icon">
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => shareWhatsApp(mainLink)} variant="outline" className="flex-1 gap-2">
              <MessageCircle className="w-4 h-4" />
              Compartir
            </Button>
            <Button onClick={() => setSelectedQRLink('main')} variant="outline" className="gap-2">
              <QrCode className="w-4 h-4" />
              QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Links */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Links de Campaña</h2>
        
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : referralLinks?.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                No tienes links de campaña aún. Crea uno para personalizar el WhatsApp que verán tus referidos.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Crear primer link
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {referralLinks?.map((link) => {
              const linkUrl = buildLink(link.id, link.country || undefined);
              return (
                <Card key={link.id} className={`glass-card ${!link.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {link.country && (
                            <span>{countries.find(c => c.code === link.country)?.flag}</span>
                          )}
                          {link.name}
                          {!link.isActive && (
                            <span className="text-xs text-muted-foreground">(inactivo)</span>
                          )}
                        </CardTitle>
                        {link.whatsappOverride && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📱 {link.whatsappOverride}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(link)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedQRLink(link.id)}>
                            <QrCode className="w-4 h-4 mr-2" /> Ver QR
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(link)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input value={linkUrl} readOnly className="font-mono text-xs" />
                      <Button onClick={() => copyLink(linkUrl)} variant="outline" size="icon">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={() => shareWhatsApp(linkUrl, link.messageTemplate || undefined)} 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Compartir
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={isCreateDialogOpen || !!editingLink} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingLink(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Editar Link' : 'Crear Link de Campaña'}</DialogTitle>
            <DialogDescription>
              Personaliza el contacto que verán quienes usen este link
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del link *</Label>
              <Input 
                placeholder="Ej: Instagram Chile, TikTok promo"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>País (opcional)</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>WhatsApp personalizado</Label>
              <Input 
                placeholder="Ej: 59176356972 (sin + ni espacios)"
                value={formData.whatsappOverride}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappOverride: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Si lo dejas vacío, usarán tu WhatsApp principal
              </p>
            </div>

            <div className="space-y-2">
              <Label>Etiqueta de contacto</Label>
              <Input 
                placeholder="Ej: Te atiende: María (Promo Instagram)"
                value={formData.contactLabelOverride}
                onChange={(e) => setFormData(prev => ({ ...prev, contactLabelOverride: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Mensaje predefinido (WhatsApp)</Label>
              <Textarea 
                placeholder="Ej: Hola, vi tu promo en Instagram y quiero jugar..."
                value={formData.messageTemplate}
                onChange={(e) => setFormData(prev => ({ ...prev, messageTemplate: e.target.value }))}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Este mensaje se abrirá pre-escrito al tocar el botón de WhatsApp
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label>Link activo</Label>
              <Switch 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setEditingLink(null);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={editingLink ? handleUpdate : handleCreate}
              disabled={createLink.isPending || updateLink.isPending}
            >
              {editingLink ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={!!selectedQRLink} onOpenChange={(open) => !open && setSelectedQRLink(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Código QR</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div 
              id={`qr-${selectedQRLink}`}
              className="bg-white p-4 rounded-xl"
            >
              <QRCodeSVG
                value={selectedQRLink === 'main' ? mainLink : buildLink(selectedQRLink || undefined)}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <Button 
              onClick={() => downloadQR(selectedQRLink || 'main')} 
              variant="outline" 
              className="w-full gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppReferrals;
