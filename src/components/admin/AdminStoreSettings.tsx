"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  disabled?: boolean;
}

export default function AdminStoreSettings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('store_config').select('*').single();
      if (data) setConfig(data);
      setLoading(false);
    }
    fetchConfig();
  }, []);

  const save = async () => {
    const { error } = await supabase.from('store_config').update(config).eq('id', config.id);
    if (!error) alert("Configuración Maestra Actualizada ✨");
  };

  if (loading || !config) return <div className="p-20 text-center font-diner opacity-20">Sincronizando con la Base de Datos...</div>;

  return (
    <div className="max-w-4xl mx-auto px-2 pb-24 space-y-10 animate-in fade-in duration-500">
      
      {/* SECCIÓN 1: IDENTIDAD DE EMPRESA */}
      <section className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-xs uppercase tracking-tighter">ELabs Studio Config</div>
        <h4 className="font-diner text-2xl text-[#2B4233] mb-8 uppercase border-b border-gray-50 pb-4">1. Identidad de Empresa</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Nombre Legal/Tienda" value={config.store_name} onChange={(v: string) => setConfig({...config, store_name: v})} />
          <Field label="Teléfono Empresa" value={config.company_phone} onChange={(v: string) => setConfig({...config, company_phone: v})} />
          <Field label="WhatsApp Corporativo" value={config.contact_whatsapp} onChange={(v: string) => setConfig({...config, contact_whatsapp: v})} />
          <div className="sm:col-span-2 grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Field label="Calle" value={config.address_street} onChange={(v: string) => setConfig({...config, address_street: v})} />
            </div>
            <Field label="N°" value={config.address_number} onChange={(v: string) => setConfig({...config, address_number: v})} />
          </div>
          <Field label="Ciudad" value={config.address_city} onChange={(v: string) => setConfig({...config, address_city: v})} />
          <Field label="ID Legajo / Cliente (Próximamente)" value="ID-001 (Tyta Patisserie)" onChange={() => {}} disabled={true} />
        </div>
      </section>

      {/* SECCIÓN 2: IDENTIDAD DE MARCA */}
      <section className="bg-[#FDFBF7]/50 p-6 sm:p-10 rounded-[2.5rem] border border-[#EDB2D1]/20 shadow-sm">
        <h4 className="font-diner text-2xl text-[#2B4233] mb-8 uppercase border-b border-[#EDB2D1]/10 pb-4">2. Identidad de Marca</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Instagram User" value={config.instagram_user} onChange={(v: string) => setConfig({...config, instagram_user: v})} prefix="@" />
          <Field label="WhatsApp de Pedidos" value={config.whatsapp_number} onChange={(v: string) => setConfig({...config, whatsapp_number: v})} />
          <Field label="Email Público" value={config.store_email} onChange={(v: string) => setConfig({...config, store_email: v})} />
          <div className="sm:col-span-2">
            <Field label="Dirección de Retiro" value={`${config.address_street} ${config.address_number}, ${config.address_city}`} onChange={() => {}} disabled={true} />
            <p className="text-[7px] font-black uppercase text-[#EDB2D1] mt-2 ml-4 italic">* Actualmente vinculada a Identidad de Empresa</p>
          </div>
          <Field label="TikTok User" value={config.tiktok_user} onChange={(v: string) => setConfig({...config, tiktok_user: v})} />
          <Field label="Facebook User" value={config.facebook_user} onChange={(v: string) => setConfig({...config, facebook_user: v})} />
        </div>
      </section>

      {/* SECCIÓN 3: GESTIÓN INTERNA */}
      <section className="bg-[#2B4233]/5 p-6 sm:p-10 rounded-[2.5rem] border border-[#2B4233]/10 shadow-sm">
        <h4 className="font-diner text-2xl text-[#2B4233] mb-8 uppercase border-b border-[#2B4233]/5 pb-4">3. Gestión Interna</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Email Destino Alertas" value={config.alert_email_destination} onChange={(v: string) => setConfig({...config, alert_email_destination: v})} />
          <Field label="Resend API Key" value={config.resend_api_key} onChange={(v: string) => setConfig({...config, resend_api_key: v})} />
          <Field label="Contacto Emergencia" value={config.emergency_contact_name} onChange={(v: string) => setConfig({...config, emergency_contact_name: v})} />
          <Field label="Teléfono Emergencia" value={config.emergency_contact_phone} onChange={(v: string) => setConfig({...config, emergency_contact_phone: v})} />
        </div>
      </section>

      <button onClick={save} className="w-full py-6 bg-[#2B4233] text-[#EDB2D1] rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all">
        Guardar Configuración de Sistema
      </button>
    </div>
  );
}

function Field({ label, value, onChange, prefix, disabled }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-black uppercase tracking-widest text-[#2B4233]/40 ml-4">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#EDB2D1] font-black text-xs">{prefix}</span>}
        <input 
          type="text" 
          value={value || ""} 
          disabled={disabled}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className={`w-full bg-white border border-gray-100 rounded-full py-4 px-6 text-sm font-josefin outline-none transition-all shadow-sm
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'focus:border-[#EDB2D1] focus:shadow-md'}
            ${prefix ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
}