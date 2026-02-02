import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  Trash2,
  Play,
  Settings,
  FileVideo,
  MessageSquare,
  Users,
  Link2,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  message: string;
  details?: string;
}

const AdminDiagnostics = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testLeadCount, setTestLeadCount] = useState(0);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    // 1. Check landing_content/main
    try {
      const mainDoc = await getDoc(doc(db, 'landing_content', 'main'));
      if (mainDoc.exists()) {
        const data = mainDoc.data();
        const hasVsl = data?.hero?.vslYoutubeUrl && data.hero.vslYoutubeUrl.length > 5;
        diagnostics.push({
          name: 'CMS Landing Content',
          status: hasVsl ? 'success' : 'warning',
          message: hasVsl ? 'landing_content/main existe con VSL' : 'landing_content/main existe pero sin VSL',
          details: hasVsl ? `VSL URL: ${data.hero.vslYoutubeUrl.substring(0, 40)}...` : 'Configura el video en Admin > Contenido',
        });
      } else {
        diagnostics.push({
          name: 'CMS Landing Content',
          status: 'error',
          message: 'landing_content/main no existe',
          details: 'Crea el contenido desde Admin > Contenido',
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'CMS Landing Content',
        status: 'error',
        message: 'Error al verificar landing_content',
        details: error.message,
      });
    }

    // 2. Check chat_configs
    try {
      const configsQuery = query(
        collection(db, 'chat_configs'),
        where('isActive', '==', true),
        limit(1)
      );
      const configsSnap = await getDocs(configsQuery);
      if (!configsSnap.empty) {
        const configData = configsSnap.docs[0].data();
        const questionCount = configData.questions?.length || 0;
        diagnostics.push({
          name: 'Chat Config Activo',
          status: questionCount > 3 ? 'success' : 'warning',
          message: `Config "${configData.name}" activo con ${questionCount} preguntas`,
          details: questionCount > 3 
            ? 'Configuración válida' 
            : 'Pocas preguntas configuradas',
        });
      } else {
        diagnostics.push({
          name: 'Chat Config Activo',
          status: 'warning',
          message: 'No hay chat_config activo',
          details: 'Se usará la configuración por defecto',
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Chat Config Activo',
        status: 'error',
        message: 'Error al verificar chat_configs',
        details: error.message,
      });
    }

    // 3. Check settings/ai for Gemini key
    try {
      const aiDoc = await getDoc(doc(db, 'settings', 'ai'));
      if (aiDoc.exists()) {
        const hasKey = !!aiDoc.data()?.gemini_api_key;
        diagnostics.push({
          name: 'Gemini API Key',
          status: hasKey ? 'success' : 'warning',
          message: hasKey ? 'gemini_api_key configurada' : 'gemini_api_key no configurada',
          details: hasKey 
            ? 'IA lista para usar'
            : 'Se usará el gateway Lovable como fallback',
        });
      } else {
        diagnostics.push({
          name: 'Gemini API Key',
          status: 'warning',
          message: 'settings/ai no existe',
          details: 'Crea la configuración desde Admin > Configuración',
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Gemini API Key',
        status: 'error',
        message: 'Error al verificar settings/ai',
        details: error.message,
      });
    }

    // 4. Test ai-chat edge function
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{ role: 'user', content: '__start__' }],
          type: 'conversational',
          collectedData: {},
        },
      });
      
      if (error) throw error;
      if (data?.success && data?.data?.reply) {
        diagnostics.push({
          name: 'Edge Function: ai-chat',
          status: 'success',
          message: 'Responde correctamente',
          details: `Primera pregunta: "${data.data.reply.substring(0, 60)}..."`,
        });
      } else {
        diagnostics.push({
          name: 'Edge Function: ai-chat',
          status: 'warning',
          message: 'Respuesta inesperada',
          details: JSON.stringify(data).substring(0, 100),
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Edge Function: ai-chat',
        status: 'error',
        message: 'Error al invocar ai-chat',
        details: error.message,
      });
    }

    // 5. Test save-chat-lead (with isTest flag)
    try {
      const testData = {
        mergedData: {
          answers: {
            name: '__TEST_DIAGNOSTIC__',
            country: 'TEST',
            whatsapp: '+0000000000',
          },
        },
        intent: 'AGENTE',
        refCode: null,
        country: 'TEST',
        isTest: true, // Mark as test lead
      };
      
      const { data, error } = await supabase.functions.invoke('save-chat-lead', {
        body: testData,
      });
      
      if (error) throw error;
      if (data?.success && data?.leadId) {
        diagnostics.push({
          name: 'Edge Function: save-chat-lead',
          status: 'success',
          message: 'Crea leads correctamente',
          details: `Test lead creado: ${data.leadId.substring(0, 12)}...`,
        });
      } else {
        diagnostics.push({
          name: 'Edge Function: save-chat-lead',
          status: 'warning',
          message: 'Respuesta inesperada',
          details: data?.error || 'Sin error específico',
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Edge Function: save-chat-lead',
        status: 'error',
        message: 'Error al invocar save-chat-lead',
        details: error.message,
      });
    }

    // 6. Test agent-by-ref (with a sample refCode)
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('isActive', '==', true),
        where('role', 'in', ['AGENT', 'LINE_LEADER']),
        limit(1)
      );
      const usersSnap = await getDocs(usersQuery);
      
      if (!usersSnap.empty) {
        const testRefCode = usersSnap.docs[0].data().refCode;
        if (testRefCode) {
          const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-by-ref`);
          url.searchParams.set('ref', testRefCode);
          
          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.agentInfo?.whatsapp) {
              diagnostics.push({
                name: 'Edge Function: agent-by-ref',
                status: 'success',
                message: 'Resuelve refCodes correctamente',
                details: `RefCode ${testRefCode} → ${result.agentInfo.displayName || 'Agente'}`,
              });
            } else {
              diagnostics.push({
                name: 'Edge Function: agent-by-ref',
                status: 'warning',
                message: 'RefCode no devuelve whatsapp',
                details: JSON.stringify(result).substring(0, 80),
              });
            }
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } else {
          diagnostics.push({
            name: 'Edge Function: agent-by-ref',
            status: 'warning',
            message: 'Sin refCode para probar',
            details: 'El primer agente activo no tiene refCode',
          });
        }
      } else {
        diagnostics.push({
          name: 'Edge Function: agent-by-ref',
          status: 'warning',
          message: 'Sin agentes activos para probar',
          details: 'Crea al menos un agente para probar',
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Edge Function: agent-by-ref',
        status: 'error',
        message: 'Error al invocar agent-by-ref',
        details: error.message,
      });
    }

    // 7. Check network integrity (orphans/cycles)
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('isActive', '==', true)
      );
      const usersSnap = await getDocs(usersQuery);
      const users = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
      const uidSet = new Set(users.map(u => u.uid));
      
      let orphans = 0;
      let selfLoops = 0;
      
      for (const user of users) {
        const lid = (user as any).lineLeaderId;
        if (lid && lid !== '' && !uidSet.has(lid)) {
          orphans++;
        }
        if (lid && lid === user.uid) {
          selfLoops++;
        }
      }
      
      if (orphans === 0 && selfLoops === 0) {
        diagnostics.push({
          name: 'Integridad de Red',
          status: 'success',
          message: 'Sin huérfanos ni self-loops',
          details: `${users.length} usuarios activos verificados`,
        });
      } else {
        diagnostics.push({
          name: 'Integridad de Red',
          status: 'warning',
          message: `${orphans} huérfanos, ${selfLoops} self-loops`,
          details: 'Revisar en Admin > Red para corregir',
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Integridad de Red',
        status: 'error',
        message: 'Error al verificar red',
        details: error.message,
      });
    }

    // Count test leads
    try {
      const testLeadsQuery = query(
        collection(db, 'leads'),
        where('applicant.name', '==', '__TEST_DIAGNOSTIC__')
      );
      const testLeadsSnap = await getDocs(testLeadsQuery);
      setTestLeadCount(testLeadsSnap.size);
    } catch {
      // Ignore
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  const deleteTestLeads = async () => {
    try {
      const testLeadsQuery = query(
        collection(db, 'leads'),
        where('applicant.name', '==', '__TEST_DIAGNOSTIC__')
      );
      const testLeadsSnap = await getDocs(testLeadsQuery);
      
      let deleted = 0;
      for (const docSnap of testLeadsSnap.docs) {
        await deleteDoc(docSnap.ref);
        deleted++;
      }
      
      setTestLeadCount(0);
      toast.success(`${deleted} leads de prueba eliminados`);
    } catch (error: any) {
      toast.error('Error al eliminar leads de prueba: ' + error.message);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">OK</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Advertencia</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Error</Badge>;
      case 'pending':
        return <Badge className="bg-muted text-muted-foreground">Pendiente</Badge>;
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Diagnósticos</h1>
          <p className="text-muted-foreground">
            Verificación automática del sistema
          </p>
        </div>
        <div className="flex gap-2">
          {testLeadCount > 0 && (
            <Button onClick={deleteTestLeads} variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Borrar {testLeadCount} test leads
            </Button>
          )}
          <Button onClick={runDiagnostics} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Ejecutar diagnósticos
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{successCount}</p>
          <p className="text-sm text-muted-foreground">OK</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{warningCount}</p>
          <p className="text-sm text-muted-foreground">Advertencias</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{errorCount}</p>
          <p className="text-sm text-muted-foreground">Errores</p>
        </div>
      </div>

      {/* Results */}
      <div className="glass-card rounded-xl divide-y divide-border">
        {isRunning && results.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Ejecutando diagnósticos...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Haz clic en "Ejecutar diagnósticos" para comenzar</p>
          </div>
        ) : (
          results.map((result, index) => (
            <div key={index} className="p-4 flex items-start gap-4">
              {getStatusIcon(result.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{result.name}</h3>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-muted-foreground">{result.message}</p>
                {result.details && (
                  <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                    {result.details}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDiagnostics;
