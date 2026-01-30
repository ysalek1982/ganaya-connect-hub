import { useState, useMemo } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Phone, MapPin, Calendar, Star, MessageCircle, Eye, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FirebaseLead, LeadStatus, LeadTier } from '@/lib/firebase-types';

interface LeadsKanbanProps {
  leads: (FirebaseLead & { id: string })[];
  onViewLead: (lead: FirebaseLead & { id: string }) => void;
  onWhatsApp: (lead: FirebaseLead & { id: string }, template: string) => void;
  getAgentName: (id: string | null) => string;
}

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'NUEVO', label: 'Nuevos', color: 'bg-green-500' },
  { id: 'CONTACTADO', label: 'Contactados', color: 'bg-yellow-500' },
  { id: 'APROBADO', label: 'Aprobados', color: 'bg-blue-500' },
  { id: 'ONBOARDED', label: 'Onboarded', color: 'bg-primary' },
  { id: 'RECHAZADO', label: 'Rechazados', color: 'bg-red-500' },
];

const tierBadge = (tier: LeadTier | null) => {
  const colors: Record<LeadTier, string> = {
    PROMETEDOR: 'bg-primary/20 text-primary border-primary/30',
    POTENCIAL: 'bg-gold/20 text-gold border-gold/30',
    NOVATO: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
  };
  return tier ? colors[tier] : 'bg-muted text-muted-foreground border-muted';
};

interface LeadCardProps {
  lead: FirebaseLead & { id: string };
  onView: () => void;
  onWhatsApp: () => void;
  isDragging?: boolean;
}

const LeadCard = ({ lead, onView, onWhatsApp, isDragging }: LeadCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card rounded-xl p-3 group transition-all ${
        isDragging ? 'opacity-50 ring-2 ring-primary' : 'hover:border-primary/30'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 p-1 rounded hover:bg-muted/50 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{lead.name}</span>
            {lead.tier && (
              <Badge variant="outline" className={`text-xs ${tierBadge(lead.tier)}`}>
                {lead.tier}
              </Badge>
            )}
          </div>
          
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{lead.country}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span className="truncate">{lead.contact.whatsapp || 'Sin WhatsApp'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(lead.createdAt), 'dd/MM')}</span>
              {lead.scoreTotal > 0 && (
                <>
                  <Star className="w-3 h-3 ml-2 text-gold" />
                  <span className="text-gold font-medium">{lead.scoreTotal}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mt-2 pt-2 border-t border-border/50">
        <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs" onClick={onWhatsApp}>
          <MessageCircle className="w-3 h-3 mr-1 text-[#25D366]" />
          WhatsApp
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onView}>
          <Eye className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  column: { id: LeadStatus; label: string; color: string };
  leads: (FirebaseLead & { id: string })[];
  onViewLead: (lead: FirebaseLead & { id: string }) => void;
  onWhatsApp: (lead: FirebaseLead & { id: string }) => void;
}

const KanbanColumn = ({ column, leads, onViewLead, onWhatsApp }: KanbanColumnProps) => {
  return (
    <div className="flex flex-col min-w-[280px] md:min-w-0 bg-muted/20 rounded-xl border border-border/50">
      {/* Column header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/50">
        <div className={`w-2 h-2 rounded-full ${column.color}`} />
        <span className="font-semibold text-sm">{column.label}</span>
        <Badge variant="outline" className="ml-auto text-xs">
          {leads.length}
        </Badge>
      </div>
      
      {/* Cards */}
      <ScrollArea className="flex-1 p-2">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 min-h-[200px]">
            {leads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onView={() => onViewLead(lead)}
                onWhatsApp={() => onWhatsApp(lead)}
              />
            ))}
            {leads.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Sin postulaciones
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
};

export const LeadsKanban = ({ leads, onViewLead, onWhatsApp, getAgentName }: LeadsKanbanProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const leadsByStatus = useMemo(() => {
    const grouped: Record<LeadStatus, (FirebaseLead & { id: string })[]> = {
      NUEVO: [],
      CONTACTADO: [],
      APROBADO: [],
      RECHAZADO: [],
      ONBOARDED: [],
      CERRADO: [],
      DESCARTADO: [],
    };
    
    leads.forEach(lead => {
      if (grouped[lead.status]) {
        grouped[lead.status].push(lead);
      }
    });
    
    return grouped;
  }, [leads]);

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const leadId = active.id as string;
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Determine target column from drop position
    const overElement = over.id as string;
    let targetStatus: LeadStatus | null = null;
    
    // Check if dropped on a column or on another card
    for (const col of COLUMNS) {
      if (leadsByStatus[col.id].some(l => l.id === overElement)) {
        targetStatus = col.id;
        break;
      }
    }
    
    // If dropped on empty column space, check the over.id directly
    if (!targetStatus) {
      const column = COLUMNS.find(c => c.id === overElement);
      if (column) {
        targetStatus = column.id;
      }
    }

    if (!targetStatus || targetStatus === lead.status) return;

    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: targetStatus,
        lastUpdatedAt: serverTimestamp(),
      });
      toast.success(`Movido a ${COLUMNS.find(c => c.id === targetStatus)?.label}`);
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex-1">
            <KanbanColumn
              column={column}
              leads={leadsByStatus[column.id]}
              onViewLead={onViewLead}
              onWhatsApp={(lead) => onWhatsApp(lead, 'first_contact')}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <div className="glass-card rounded-xl p-3 shadow-xl ring-2 ring-primary opacity-90">
            <div className="font-medium text-sm">{activeLead.name}</div>
            <div className="text-xs text-muted-foreground">{activeLead.country}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
