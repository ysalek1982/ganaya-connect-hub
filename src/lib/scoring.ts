export interface AgentAnswers {
  binance_verificada: boolean;
  p2p_nivel: 'basico' | 'medio' | 'avanzado';
  horas_dia: '1-2' | '3-5' | '6+';
  banca_300: boolean;
  exp_casinos: boolean;
  exp_atencion: boolean;
  quiere_empezar: boolean;
}

export interface ScoringResult {
  score: number;
  label: 'AGENTE_POTENCIAL_ALTO' | 'AGENTE_POTENCIAL_MEDIO' | 'AGENTE_POTENCIAL_BAJO' | 'CLIENTE' | 'NO_PRIORITARIO';
  breakdown: {
    binance: number;
    p2p: number;
    horas: number;
    banca: number;
    exp_casinos: number;
    exp_atencion: number;
    empezar: number;
  };
}

export const calculateScore = (answers: Partial<AgentAnswers>): ScoringResult => {
  const breakdown = {
    binance: answers.binance_verificada ? 30 : 0,
    p2p: answers.p2p_nivel === 'avanzado' ? 15 : answers.p2p_nivel === 'medio' ? 10 : answers.p2p_nivel === 'basico' ? 5 : 0,
    horas: answers.horas_dia === '6+' ? 20 : answers.horas_dia === '3-5' ? 10 : answers.horas_dia === '1-2' ? 5 : 0,
    banca: answers.banca_300 ? 20 : 0,
    exp_casinos: answers.exp_casinos ? 10 : 0,
    exp_atencion: answers.exp_atencion ? 10 : 0,
    empezar: answers.quiere_empezar ? 5 : 0,
  };

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  let label: ScoringResult['label'];
  if (score >= 80) {
    label = 'AGENTE_POTENCIAL_ALTO';
  } else if (score >= 60) {
    label = 'AGENTE_POTENCIAL_MEDIO';
  } else if (score >= 40) {
    label = 'AGENTE_POTENCIAL_BAJO';
  } else {
    label = 'CLIENTE';
  }

  return { score, label, breakdown };
};

export const getLabelColor = (label: ScoringResult['label']) => {
  switch (label) {
    case 'AGENTE_POTENCIAL_ALTO':
      return 'text-primary bg-primary/20 border-primary/30';
    case 'AGENTE_POTENCIAL_MEDIO':
      return 'text-gold bg-gold/20 border-gold/30';
    case 'AGENTE_POTENCIAL_BAJO':
      return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
    case 'CLIENTE':
    case 'NO_PRIORITARIO':
      return 'text-muted-foreground bg-muted/50 border-muted';
  }
};

export const getLabelText = (label: ScoringResult['label']) => {
  switch (label) {
    case 'AGENTE_POTENCIAL_ALTO':
      return 'Potencial Alto';
    case 'AGENTE_POTENCIAL_MEDIO':
      return 'Potencial Medio';
    case 'AGENTE_POTENCIAL_BAJO':
      return 'Potencial Bajo';
    case 'CLIENTE':
      return 'Cliente';
    case 'NO_PRIORITARIO':
      return 'No Prioritario';
  }
};
