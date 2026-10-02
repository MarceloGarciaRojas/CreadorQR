import React from 'react';
import {
  Globe,
  Wifi,
  User,
  FileText,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import { QRContentType, WifiData, VCardData, EmailData, WhatsAppData, CalendarData } from '../../types/qr';

interface ContentInputProps {
  contentType: QRContentType;
  onTypeChange: (type: QRContentType) => void;
  urlValue: string;
  onUrlChange: (v: string) => void;
  textValue: string;
  onTextChange: (v: string) => void;
  wifiData: WifiData;
  onWifiChange: (v: WifiData) => void;
  vcardData: VCardData;
  onVcardChange: (v: VCardData) => void;
  emailData: EmailData;
  onEmailChange: (v: EmailData) => void;
  phoneValue: string;
  onPhoneChange: (v: string) => void;
  whatsappData: WhatsAppData;
  onWhatsappChange: (v: WhatsAppData) => void;
  calendarData: CalendarData;
  onCalendarChange: (v: CalendarData) => void;
}

const CONTENT_TYPES: { id: QRContentType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'url', label: 'Enlace Web', icon: Globe },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'vcard', label: 'Contacto', icon: User },
  { id: 'text', label: 'Texto', icon: FileText },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Teléfono', icon: Phone },
  { id: 'calendar', label: 'Evento', icon: Calendar },
];

export const ContentInput: React.FC<ContentInputProps> = ({
  contentType,
  onTypeChange,
  urlValue,
  onUrlChange,
  textValue,
  onTextChange,
  wifiData,
  onWifiChange,
  vcardData,
  onVcardChange,
  emailData,
  onEmailChange,
  phoneValue,
  onPhoneChange,
  whatsappData,
  onWhatsappChange,
  calendarData,
  onCalendarChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Botones de selección de tipo de contenido */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-none">
        {CONTENT_TYPES.map((item) => {
          const Icon = item.icon;
          const isActive = contentType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTypeChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none'
                  : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Campos de entrada según el tipo de contenido seleccionado */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        {contentType === 'url' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Dirección Web (URL)
            </label>
            <div className="relative">
              <input
                type="url"
                value={urlValue}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://ejemplo.com o www.mipagina.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Se añadirá automáticamente https:// si no lo incluyes.
            </p>
          </div>
        )}

        {contentType === 'text' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Texto Libre o Mensaje
            </label>
            <textarea
              rows={4}
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Escribe aquí cualquier información, notas, direcciones, claves..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{textValue.length} caracteres</span>
            </div>
          </div>
        )}

        {contentType === 'wifi' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Nombre de la red (SSID) *
              </label>
              <input
                type="text"
                value={wifiData.ssid}
                onChange={(e) => onWifiChange({ ...wifiData, ssid: e.target.value })}
                placeholder="MiRedWiFi_Casa"
                className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Contraseña
              </label>
              <input
                type="text"
                value={wifiData.password}
                onChange={(e) => onWifiChange({ ...wifiData, password: e.target.value })}
                placeholder="Clave de seguridad"
                disabled={wifiData.encryption === 'nopass'}
                className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Tipo de Seguridad
                </label>
                <select
                  value={wifiData.encryption}
                  onChange={(e) => onWifiChange({ ...wifiData, encryption: e.target.value as any })}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Sin Contraseña (Abierta)</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={wifiData.hidden}
                    onChange={(e) => onWifiChange({ ...wifiData, hidden: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Red Oculta</span>
                </label>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Permite a los invitados conectarse escaneando el código sin tener que teclear la contraseña.
            </p>
          </div>
        )}

        {contentType === 'vcard' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={vcardData.firstName}
                  onChange={(e) => onVcardChange({ ...vcardData, firstName: e.target.value })}
                  placeholder="Juan"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={vcardData.lastName}
                  onChange={(e) => onVcardChange({ ...vcardData, lastName: e.target.value })}
                  placeholder="Pérez"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Teléfono Móvil
                </label>
                <input
                  type="tel"
                  value={vcardData.phone}
                  onChange={(e) => onVcardChange({ ...vcardData, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  value={vcardData.email}
                  onChange={(e) => onVcardChange({ ...vcardData, email: e.target.value })}
                  placeholder="juan@empresa.com"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Empresa
                </label>
                <input
                  type="text"
                  value={vcardData.company}
                  onChange={(e) => onVcardChange({ ...vcardData, company: e.target.value })}
                  placeholder="Acme Inc."
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Cargo
                </label>
                <input
                  type="text"
                  value={vcardData.jobTitle}
                  onChange={(e) => onVcardChange({ ...vcardData, jobTitle: e.target.value })}
                  placeholder="Director Creativo"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Sitio Web
              </label>
              <input
                type="url"
                value={vcardData.website}
                onChange={(e) => onVcardChange({ ...vcardData, website: e.target.value })}
                placeholder="https://juanperez.com"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        )}

        {contentType === 'whatsapp' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Número con prefijo internacional *
              </label>
              <input
                type="tel"
                value={whatsappData.phoneNumber}
                onChange={(e) => onWhatsappChange({ ...whatsappData, phoneNumber: e.target.value })}
                placeholder="Ejemplo: 34612345678 o 5215512345678"
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Mensaje predefinido (opcional)
              </label>
              <textarea
                rows={2}
                value={whatsappData.message}
                onChange={(e) => onWhatsappChange({ ...whatsappData, message: e.target.value })}
                placeholder="¡Hola! Quisiera más información sobre..."
                className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        )}

        {contentType === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Correo destinatario *
              </label>
              <input
                type="email"
                value={emailData.address}
                onChange={(e) => onEmailChange({ ...emailData, address: e.target.value })}
                placeholder="contacto@ejemplo.com"
                className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Asunto (opcional)
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => onEmailChange({ ...emailData, subject: e.target.value })}
                placeholder="Consulta sobre servicios"
                className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Cuerpo del mensaje (opcional)
              </label>
              <textarea
                rows={2}
                value={emailData.body}
                onChange={(e) => onEmailChange({ ...emailData, body: e.target.value })}
                placeholder="Detalla aquí tu consulta..."
                className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        )}

        {contentType === 'phone' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Número de teléfono
            </label>
            <input
              type="tel"
              value={phoneValue}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+34 910 000 000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-[11px] text-slate-400">
              Al escanearlo, el dispositivo abrirá directamente el marcador para llamar.
            </p>
          </div>
        )}

        {contentType === 'calendar' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Título del Evento *
              </label>
              <input
                type="text"
                value={calendarData.title}
                onChange={(e) => onCalendarChange({ ...calendarData, title: e.target.value })}
                placeholder="Reunión de Proyecto / Boda / Conferencia"
                className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Inicio
                </label>
                <input
                  type="datetime-local"
                  value={calendarData.startDate}
                  onChange={(e) => onCalendarChange({ ...calendarData, startDate: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Fin
                </label>
                <input
                  type="datetime-local"
                  value={calendarData.endDate}
                  onChange={(e) => onCalendarChange({ ...calendarData, endDate: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Ubicación
              </label>
              <input
                type="text"
                value={calendarData.location}
                onChange={(e) => onCalendarChange({ ...calendarData, location: e.target.value })}
                placeholder="Sala de conferencias / Online"
                className="mt-1 w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
