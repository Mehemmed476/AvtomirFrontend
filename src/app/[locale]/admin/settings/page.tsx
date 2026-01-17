"use client";

import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/api";
import { SiteSettings } from "@/types";
import { Save, Loader2, MapPin, Phone, Mail, Globe } from "lucide-react";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<SiteSettings>({
        Phone: "", Email: "", Address: "", MapUrl: "",
        Facebook: "", Instagram: "", Whatsapp: "", WorkHours: ""
    });

    useEffect(() => {
        getSettings().then((data) => {
            if (data) setFormData(data);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateSettings(formData);
        setLoading(false);
        if (res.success) {
            alert("Yadda saxlanıldı!");
        } else {
            alert("Xəta baş verdi.");
        }
    };

    // Ümumi Input Stili
    const inputClass = "w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all shadow-sm";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <div>
            <div className="mb-8">
                {/* Başlıq rəngini tündləşdirdik */}
                <h1 className="text-3xl font-bold text-gray-800">Sayt Tənzimləmələri</h1>
                <p className="text-gray-600 mt-2">Footer, Əlaqə və Haqqımızda səhifələrindəki məlumatları buradan idarə edin.</p>
            </div>

            {/* Ağ Kart */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">

                <div className="p-8 space-y-8">

                    {/* Bölmə 1: Əlaqə */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <Phone size={20} className="text-blue-500" /> Əlaqə Məlumatları
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Telefon</label>
                                <input name="Phone" value={formData.Phone} onChange={handleChange} className={inputClass} placeholder="055 555 55 55" />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input name="Email" value={formData.Email} onChange={handleChange} className={inputClass} placeholder="info@example.com" />
                            </div>
                            <div>
                                <label className={labelClass}>İş Saatları</label>
                                <input name="WorkHours" value={formData.WorkHours} onChange={handleChange} className={inputClass} placeholder="09:00 - 18:00" />
                            </div>
                            <div>
                                <label className={labelClass}>WhatsApp Linki</label>
                                <input name="Whatsapp" value={formData.Whatsapp} onChange={handleChange} placeholder="https://wa.me/994..." className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Bölmə 2: Məkan */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <MapPin size={20} className="text-red-500" /> Ünvan və Xəritə
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Fiziki Ünvan</label>
                                <textarea name="Address" rows={3} value={formData.Address} onChange={handleChange} className={inputClass} placeholder="Atatürk prospekti..." />
                            </div>
                            <div>
                                <label className={labelClass}>Google Map Embed Linki (src)</label>
                                <input name="MapUrl" value={formData.MapUrl} onChange={handleChange} className={`${inputClass} font-mono text-xs`} placeholder="https://www.google.com/maps/embed?pb=..." />
                                <p className="text-xs text-gray-500 mt-1.5 bg-blue-50 p-2 rounded text-blue-700 border border-blue-100">
                                    <b>Diqqət:</b> Google Maps-də "Share" {'->'} "Embed a map" edib, `iframe` kodunun içindəki dırnaq arası <code>src="..."</code> linkini bura yapışdırın.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bölmə 3: Sosial */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <Globe size={20} className="text-purple-500" /> Sosial Şəbəkələr
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Instagram</label>
                                <input name="Instagram" value={formData.Instagram} onChange={handleChange} className={inputClass} placeholder="https://instagram.com/..." />
                            </div>
                            <div>
                                <label className={labelClass}>Facebook</label>
                                <input name="Facebook" value={formData.Facebook} onChange={handleChange} className={inputClass} placeholder="https://facebook.com/..." />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Buton */}
                <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end">
                    <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-70 hover:shadow-md">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Yadda Saxla
                    </button>
                </div>

            </form>
        </div>
    );
}