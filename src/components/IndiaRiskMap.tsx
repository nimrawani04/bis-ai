import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Shield, MessageSquare, X, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface StateRiskData {
  id: string;
  name: string;
  risk: RiskLevel;
  topFakeProduct: string;
  fakeCount: number;
  categories: string[];
  precaution: string;
}

// Static risk data — replace with live DB data when available
export const stateRiskData: StateRiskData[] = [
  { id: 'MH', name: 'Maharashtra', risk: 'high', topFakeProduct: 'Electric Wires & Cables', fakeCount: 142, categories: ['Electrical', 'Helmets', 'LPG Cylinders'], precaution: 'Check ISI mark on cables. Buy from authorised dealers only. Avoid loose market purchases.' },
  { id: 'DL', name: 'Delhi', risk: 'high', topFakeProduct: 'Phone Chargers & Adapters', fakeCount: 198, categories: ['Electronics', 'Chargers', 'Pressure Cookers'], precaution: 'Verify BIS registration on chargers. Fake chargers cause fires. Buy from brand stores or authorised e-commerce.' },
  { id: 'UP', name: 'Uttar Pradesh', risk: 'high', topFakeProduct: 'Packaged Drinking Water', fakeCount: 167, categories: ['Food & Beverages', 'Cement', 'Steel Rods'], precaution: 'Check ISI mark IS:14543 on water bottles. Verify seal integrity. Report to FSSAI if suspicious.' },
  { id: 'WB', name: 'West Bengal', risk: 'high', topFakeProduct: 'Gold Jewellery (Fake Hallmark)', fakeCount: 134, categories: ['Jewellery', 'Electrical', 'Toys'], precaution: 'Verify HUID number on BIS Care App. Buy only from BIS-licensed hallmarking centres.' },
  { id: 'RJ', name: 'Rajasthan', risk: 'medium', topFakeProduct: 'Cement & Building Materials', fakeCount: 89, categories: ['Construction', 'Jewellery', 'Textiles'], precaution: 'Check IS:269 mark on cement bags. Verify manufacturer details. Avoid unbranded construction materials.' },
  { id: 'GJ', name: 'Gujarat', risk: 'medium', topFakeProduct: 'Automotive Parts', fakeCount: 76, categories: ['Auto Parts', 'Chemicals', 'Textiles'], precaution: 'Buy auto parts from authorised dealers. Check BIS certification for safety-critical parts like brakes.' },
  { id: 'TN', name: 'Tamil Nadu', risk: 'medium', topFakeProduct: 'LED Bulbs & Luminaires', fakeCount: 65, categories: ['Electrical', 'Electronics', 'Footwear'], precaution: 'Check BIS registration number on LED packaging. Fake LEDs pose fire and shock hazards.' },
  { id: 'KA', name: 'Karnataka', risk: 'medium', topFakeProduct: 'Infant Milk Substitutes', fakeCount: 58, categories: ['Food', 'Electronics', 'Cosmetics'], precaution: 'Verify FSSAI and BIS marks on infant food. Check manufacturing date and batch number carefully.' },
  { id: 'MP', name: 'Madhya Pradesh', risk: 'medium', topFakeProduct: 'Steel Bars & TMT Rods', fakeCount: 71, categories: ['Construction', 'Electrical', 'Agri-inputs'], precaution: 'Verify IS:1786 mark on TMT bars. Fake steel in construction is a serious safety hazard.' },
  { id: 'AP', name: 'Andhra Pradesh', risk: 'low', topFakeProduct: 'Pesticides & Fertilisers', fakeCount: 34, categories: ['Agriculture', 'Electrical', 'Food'], precaution: 'Buy pesticides from licensed dealers. Check CIB&RC registration. Verify batch number.' },
  { id: 'TS', name: 'Telangana', risk: 'low', topFakeProduct: 'Electronic Toys', fakeCount: 28, categories: ['Toys', 'Electronics', 'Cosmetics'], precaution: 'Check BIS certification IS:9873 on toys. Avoid toys with sharp edges or small parts for children under 3.' },
  { id: 'KL', name: 'Kerala', risk: 'low', topFakeProduct: 'Ayurvedic Medicines', fakeCount: 22, categories: ['Medicines', 'Food', 'Electrical'], precaution: 'Buy Ayurvedic products from licensed pharmacies. Check AYUSH Ministry registration number.' },
  { id: 'PB', name: 'Punjab', risk: 'medium', topFakeProduct: 'Tractor Parts & Agri Equipment', fakeCount: 54, categories: ['Agriculture', 'Auto Parts', 'Electrical'], precaution: 'Buy tractor parts from authorised dealers. Fake parts can cause accidents. Verify BIS mark.' },
  { id: 'HR', name: 'Haryana', risk: 'medium', topFakeProduct: 'Helmets (Two-Wheeler)', fakeCount: 62, categories: ['Safety Equipment', 'Auto Parts', 'Electrical'], precaution: 'Check ISI mark IS:4151 on helmets. Fake helmets offer no protection. Buy from authorised dealers.' },
  { id: 'BR', name: 'Bihar', risk: 'high', topFakeProduct: 'Kerosene & Fuel Adulterants', fakeCount: 112, categories: ['Fuel', 'Food', 'Medicines'], precaution: 'Report fuel adulteration to district authorities. Use authorised PDS outlets only.' },
  { id: 'OR', name: 'Odisha', risk: 'low', topFakeProduct: 'Counterfeit Medicines', fakeCount: 31, categories: ['Medicines', 'Food', 'Construction'], precaution: 'Verify drug license on medicine packaging. Check batch number on CDSCO portal.' },
  { id: 'AS', name: 'Assam', risk: 'low', topFakeProduct: 'Tea & Spice Adulterants', fakeCount: 19, categories: ['Food', 'Medicines', 'Electrical'], precaution: 'Buy tea from FSSAI-certified brands. Check for AGMARK certification on spices.' },
  { id: 'JH', name: 'Jharkhand', risk: 'medium', topFakeProduct: 'Mining Safety Equipment', fakeCount: 47, categories: ['Safety Equipment', 'Construction', 'Electrical'], precaution: 'Verify BIS certification on safety helmets and equipment. Non-certified equipment is illegal in mines.' },
  { id: 'CG', name: 'Chhattisgarh', risk: 'low', topFakeProduct: 'Fertilisers & Seeds', fakeCount: 26, categories: ['Agriculture', 'Construction', 'Food'], precaution: 'Buy seeds from government-certified dealers. Check FCO registration on fertiliser bags.' },
  { id: 'HP', name: 'Himachal Pradesh', risk: 'low', topFakeProduct: 'Counterfeit Woollen Goods', fakeCount: 15, categories: ['Textiles', 'Food', 'Medicines'], precaution: 'Check Woolmark certification on woollen products. Buy from Himachal Pradesh government emporiums.' },
  { id: 'UK', name: 'Uttarakhand', risk: 'low', topFakeProduct: 'Herbal & Ayurvedic Products', fakeCount: 18, categories: ['Medicines', 'Food', 'Cosmetics'], precaution: 'Verify AYUSH registration. Buy from licensed pharmacies. Check manufacturing address.' },
  { id: 'GA', name: 'Goa', risk: 'low', topFakeProduct: 'Counterfeit Alcohol & Beverages', fakeCount: 12, categories: ['Beverages', 'Cosmetics', 'Electrical'], precaution: 'Buy alcohol from licensed shops. Check hologram seal. Report to Excise Department if suspicious.' },
  { id: 'MN', name: 'Manipur', risk: 'low', topFakeProduct: 'Counterfeit Medicines', fakeCount: 9, categories: ['Medicines', 'Food', 'Electrical'], precaution: 'Verify drug license. Check CDSCO portal for drug registration. Buy from licensed pharmacies.' },
  { id: 'MZ', name: 'Mizoram', risk: 'low', topFakeProduct: 'Substandard Electrical Goods', fakeCount: 8, categories: ['Electrical', 'Food', 'Medicines'], precaution: 'Check ISI mark on electrical goods. Avoid unbranded switches and wiring accessories.' },
  { id: 'NL', name: 'Nagaland', risk: 'low', topFakeProduct: 'Counterfeit FMCG Products', fakeCount: 7, categories: ['FMCG', 'Food', 'Medicines'], precaution: 'Check batch number and MRP on FMCG products. Verify manufacturer address.' },
  { id: 'TR', name: 'Tripura', risk: 'low', topFakeProduct: 'Substandard Food Products', fakeCount: 11, categories: ['Food', 'Medicines', 'Electrical'], precaution: 'Check FSSAI license number on food packaging. Verify expiry date and storage conditions.' },
  { id: 'SK', name: 'Sikkim', risk: 'low', topFakeProduct: 'Counterfeit Organic Products', fakeCount: 6, categories: ['Food', 'Cosmetics', 'Medicines'], precaution: 'Verify NPOP certification on organic products. Buy from government-certified organic stores.' },
  { id: 'AR', name: 'Arunachal Pradesh', risk: 'low', topFakeProduct: 'Substandard Construction Materials', fakeCount: 10, categories: ['Construction', 'Electrical', 'Food'], precaution: 'Check ISI mark on cement and steel. Verify manufacturer details on construction materials.' },
  { id: 'ME', name: 'Meghalaya', risk: 'low', topFakeProduct: 'Counterfeit Medicines', fakeCount: 8, categories: ['Medicines', 'Food', 'Electrical'], precaution: 'Buy medicines from licensed pharmacies. Check CDSCO registration. Verify batch number.' },
];

const riskColors: Record<RiskLevel, { fill: string; stroke: string; badge: string; label: string }> = {
  high:   { fill: '#dc2626', stroke: '#991b1b', badge: 'bg-red-600 text-white',    label: 'High Risk' },
  medium: { fill: '#d97706', stroke: '#92400e', badge: 'bg-amber-500 text-white',  label: 'Medium Risk' },
  low:    { fill: '#16a34a', stroke: '#14532d', badge: 'bg-green-600 text-white',  label: 'Low Risk' },
};

// Simplified India SVG paths — approximate state shapes
// cx/cy = label center, path = simplified polygon
const statePaths: Record<string, { d: string; cx: number; cy: number }> = {
  JK:  { d: 'M 200 30 L 240 25 L 270 45 L 260 70 L 230 80 L 200 70 Z', cx: 235, cy: 52 },
  HP:  { d: 'M 230 80 L 260 70 L 275 90 L 255 110 L 235 105 Z', cx: 252, cy: 92 },
  PB:  { d: 'M 200 70 L 230 80 L 235 105 L 210 110 L 195 90 Z', cx: 215, cy: 90 },
  UK:  { d: 'M 255 110 L 275 90 L 295 100 L 290 125 L 265 130 Z', cx: 277, cy: 112 },
  HR:  { d: 'M 210 110 L 235 105 L 265 130 L 250 145 L 220 140 L 205 125 Z', cx: 235, cy: 128 },
  DL:  { d: 'M 240 130 L 255 128 L 258 142 L 243 144 Z', cx: 249, cy: 136 },
  RJ:  { d: 'M 170 110 L 210 110 L 205 125 L 220 140 L 215 175 L 185 195 L 155 185 L 145 155 L 155 130 Z', cx: 185, cy: 155 },
  UP:  { d: 'M 250 145 L 265 130 L 290 125 L 320 135 L 340 155 L 330 180 L 300 190 L 270 185 L 250 170 L 240 155 Z', cx: 290, cy: 162 },
  BR:  { d: 'M 330 180 L 360 170 L 380 185 L 375 210 L 350 220 L 325 210 Z', cx: 352, cy: 196 },
  SK:  { d: 'M 380 155 L 395 150 L 400 165 L 388 170 Z', cx: 390, cy: 160 },
  AR:  { d: 'M 420 120 L 460 115 L 470 140 L 445 150 L 415 145 Z', cx: 443, cy: 133 },
  NL:  { d: 'M 430 150 L 455 148 L 460 165 L 435 168 Z', cx: 445, cy: 158 },
  MN:  { d: 'M 435 168 L 460 165 L 462 182 L 438 184 Z', cx: 449, cy: 175 },
  MZ:  { d: 'M 415 185 L 438 184 L 440 200 L 418 202 Z', cx: 428, cy: 193 },
  TR:  { d: 'M 400 185 L 415 185 L 418 202 L 402 200 Z', cx: 409, cy: 193 },
  ME:  { d: 'M 395 165 L 420 162 L 422 178 L 398 180 Z', cx: 409, cy: 171 },
  AS:  { d: 'M 380 150 L 420 145 L 430 162 L 395 165 L 375 162 Z', cx: 402, cy: 156 },
  WB:  { d: 'M 360 170 L 380 165 L 385 190 L 375 215 L 355 220 L 345 200 Z', cx: 365, cy: 195 },
  JH:  { d: 'M 325 210 L 350 220 L 355 245 L 330 255 L 308 245 L 310 220 Z', cx: 332, cy: 235 },
  OR:  { d: 'M 330 255 L 355 245 L 365 265 L 355 290 L 330 295 L 310 275 Z', cx: 337, cy: 272 },
  MP:  { d: 'M 215 175 L 250 170 L 270 185 L 300 190 L 310 220 L 308 245 L 280 255 L 250 250 L 225 235 L 210 210 Z', cx: 262, cy: 215 },
  CG:  { d: 'M 308 245 L 330 255 L 310 275 L 295 285 L 280 270 L 280 255 Z', cx: 305, cy: 265 },
  GJ:  { d: 'M 145 155 L 185 195 L 175 225 L 150 240 L 120 230 L 110 205 L 120 180 Z', cx: 150, cy: 205 },
  MH:  { d: 'M 185 195 L 215 175 L 210 210 L 225 235 L 220 265 L 200 285 L 175 280 L 155 260 L 150 240 L 175 225 Z', cx: 190, cy: 240 },
  TL:  { d: 'M 280 255 L 295 285 L 310 275 L 320 295 L 305 315 L 280 310 L 265 290 Z', cx: 292, cy: 290 },
  AP:  { d: 'M 265 290 L 280 310 L 305 315 L 310 340 L 290 355 L 265 345 L 250 320 L 255 300 Z', cx: 280, cy: 322 },
  KA:  { d: 'M 200 285 L 220 265 L 250 250 L 265 290 L 255 300 L 250 320 L 230 330 L 205 320 L 195 300 Z', cx: 228, cy: 300 },
  TS:  { d: 'M 250 250 L 280 255 L 265 290 L 250 300 L 235 285 L 240 265 Z', cx: 260, cy: 272 },
  KL:  { d: 'M 205 320 L 230 330 L 225 360 L 210 375 L 195 360 L 198 335 Z', cx: 213, cy: 348 },
  TN:  { d: 'M 230 330 L 250 320 L 265 345 L 260 370 L 240 385 L 220 375 L 215 355 Z', cx: 242, cy: 355 },
  GA:  { d: 'M 175 280 L 195 278 L 198 295 L 178 296 Z', cx: 187, cy: 287 },
};

// Map state IDs to risk data
const stateRiskById: Record<string, StateRiskData> = {};
stateRiskData.forEach(s => { stateRiskById[s.id] = s; });

// Extra mappings for SVG IDs that differ
const svgIdToDataId: Record<string, string> = {
  TL: 'TS', // Telangana
};

function getRiskForSvgId(svgId: string): StateRiskData | undefined {
  const dataId = svgIdToDataId[svgId] || svgId;
  return stateRiskById[dataId];
}

interface PopupProps {
  state: StateRiskData;
  onClose: () => void;
  onAskAI: (state: StateRiskData) => void;
}

function StatePopup({ state, onClose, onAskAI }: PopupProps) {
  const cfg = riskColors[state.risk];
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="bg-white dark:bg-card border border-border rounded shadow-elevated w-72 pointer-events-auto animate-scale-in">
        <div className={`px-4 py-3 flex items-center justify-between rounded-t ${state.risk === 'high' ? 'bg-red-600' : state.risk === 'medium' ? 'bg-amber-500' : 'bg-green-600'}`}>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-white" />
            <span className="text-white font-bold text-sm">{state.name}</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Risk Level</span>
            <Badge className={`${cfg.badge} text-xs rounded-sm`}>{cfg.label}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Most Counterfeited Product</p>
            <p className="text-sm font-semibold text-foreground">{state.topFakeProduct}</p>
            <p className="text-xs text-muted-foreground">{state.fakeCount} reports</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Affected Categories</p>
            <div className="flex flex-wrap gap-1">
              {state.categories.map(c => (
                <span key={c} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-sm text-foreground">{c}</span>
              ))}
            </div>
          </div>
          <div className="bg-secondary/50 rounded-sm p-2">
            <p className="text-xs text-muted-foreground leading-relaxed">{state.precaution}</p>
          </div>
          <Button
            size="sm"
            className="w-full rounded-sm text-xs bg-primary hover:bg-primary/90 gap-2"
            onClick={() => onAskAI(state)}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Ask AI — How to Stay Safe
          </Button>
        </div>
      </div>
    </div>
  );
}

export function IndiaRiskMap() {
  const [selected, setSelected] = useState<StateRiskData | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAskAI = (state: StateRiskData) => {
    const query = `In ${state.name}, the most counterfeited product is "${state.topFakeProduct}". What precautions should I take, how do I identify genuine products, and where can I get authentic alternatives?`;
    navigate(`/chat?q=${encodeURIComponent(query)}`);
  };

  const highCount = stateRiskData.filter(s => s.risk === 'high').length;
  const medCount = stateRiskData.filter(s => s.risk === 'medium').length;
  const lowCount = stateRiskData.filter(s => s.risk === 'low').length;

  return (
    <section id="riskmap" className="py-12 bg-secondary/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header — GoI style */}
        <div className="mb-8">
          <div className="gov-section-header mb-2">
            <h2 className="text-xl font-bold text-foreground">Counterfeit Product Risk Map — India</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl">
            State-wise distribution of counterfeit and substandard product reports. Click any state to view the most counterfeited product and get AI-powered safety guidance.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-lg">
          {[
            { count: highCount, label: 'High Risk States', color: 'border-l-red-600 bg-red-50 dark:bg-red-950/20' },
            { count: medCount, label: 'Medium Risk States', color: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20' },
            { count: lowCount, label: 'Low Risk States', color: 'border-l-green-600 bg-green-50 dark:bg-green-950/20' },
          ].map(s => (
            <div key={s.label} className={`border border-border border-l-4 ${s.color} rounded-sm p-3 text-center`}>
              <p className="text-2xl font-bold text-foreground">{s.count}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* SVG Map */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-card border border-border rounded-sm shadow-card relative overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Interactive Risk Map</span>
                <span className="text-xs text-muted-foreground ml-auto">Click a state for details</span>
              </div>
              <div className="relative p-2">
                <svg
                  viewBox="80 20 420 380"
                  className="w-full h-auto max-h-[480px]"
                  style={{ background: 'transparent' }}
                >
                  {/* Ocean/background */}
                  <rect x="80" y="20" width="420" height="380" fill="#e8f4f8" rx="4" />

                  {Object.entries(statePaths).map(([svgId, pathData]) => {
                    const stateData = getRiskForSvgId(svgId);
                    if (!stateData) return null;
                    const cfg = riskColors[stateData.risk];
                    const isHovered = hovered === svgId;
                    const isSelected = selected?.id === stateData.id;
                    return (
                      <g key={svgId}>
                        <path
                          d={pathData.d}
                          fill={isSelected ? cfg.stroke : isHovered ? cfg.fill : cfg.fill}
                          stroke={cfg.stroke}
                          strokeWidth={isSelected || isHovered ? 2 : 0.8}
                          opacity={isSelected ? 1 : isHovered ? 0.9 : 0.75}
                          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onMouseEnter={() => setHovered(svgId)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => setSelected(isSelected ? null : stateData)}
                        />
                        {/* State label for larger states */}
                        {['MH', 'RJ', 'MP', 'UP', 'GJ', 'KA', 'AP', 'TN', 'WB', 'DL'].includes(svgId) && (
                          <text
                            x={pathData.cx}
                            y={pathData.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="7"
                            fill="white"
                            fontWeight="600"
                            style={{ pointerEvents: 'none', userSelect: 'none' }}
                          >
                            {svgId}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {selected && (
                  <StatePopup
                    state={selected}
                    onClose={() => setSelected(null)}
                    onAskAI={handleAskAI}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Legend */}
            <div className="bg-white dark:bg-card border border-border rounded-sm shadow-card">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Risk Legend</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { level: 'high' as RiskLevel, desc: '100+ reports — exercise extreme caution' },
                  { level: 'medium' as RiskLevel, desc: '40–99 reports — verify before purchase' },
                  { level: 'low' as RiskLevel, desc: 'Under 40 reports — isolated incidents' },
                ].map(item => {
                  const cfg = riskColors[item.level];
                  return (
                    <div key={item.level} className="flex items-start gap-3">
                      <div className="h-4 w-4 rounded-sm mt-0.5 shrink-0" style={{ background: cfg.fill }} />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{cfg.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top risk states list */}
            <div className="bg-white dark:bg-card border border-border rounded-sm shadow-card">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-semibold text-foreground">Top Risk States</span>
              </div>
              <div className="divide-y divide-border">
                {stateRiskData
                  .filter(s => s.risk === 'high')
                  .sort((a, b) => b.fakeCount - a.fakeCount)
                  .map(state => (
                    <button
                      key={state.id}
                      className="w-full text-left px-4 py-2.5 hover:bg-secondary/40 transition-colors flex items-center justify-between"
                      onClick={() => setSelected(state)}
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground">{state.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{state.topFakeProduct}</p>
                      </div>
                      <span className="text-xs font-bold text-red-600">{state.fakeCount}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* How to use */}
            <div className="bg-primary/5 border border-primary/20 rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">How to Use This Map</span>
              </div>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Click your state on the map</li>
                <li>View the most counterfeited product</li>
                <li>Click "Ask AI" for safety guidance</li>
                <li>Report suspicious products via the portal</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
