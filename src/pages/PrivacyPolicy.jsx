import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";

const sections = [
  {
    number: "1",
    title: "Información que recopilamos",
    content:
      "Esta aplicación NO recopila ningún dato personal. Todo el contenido que ingresas (textos, metadatos) se procesa únicamente en tu navegador y no se transmite a ningún servidor externo.",
  },
  {
    number: "2",
    title: "Almacenamiento local",
    content:
      "La app puede guardar preferencias y proyectos en el almacenamiento local (localStorage) de tu dispositivo. Estos datos permanecen en tu dispositivo y no son accesibles por nosotros.",
  },
  {
    number: "3",
    title: "Cookies",
    content:
      "No utilizamos cookies de seguimiento ni de publicidad.",
  },
  {
    number: "4",
    title: "Servicios de terceros",
    content: null,
    custom: (
      <p className="text-muted-foreground leading-relaxed">
        La app está alojada en Base44 (Wix). Consulta la política de privacidad de Base44 en{" "}
        <a
          href="https://www.base44.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          https://www.base44.com/privacy
        </a>{" "}
        para más información.
      </p>
    ),
  },
  {
    number: "5",
    title: "Contacto",
    content: null,
    custom: (
      <p className="text-muted-foreground leading-relaxed">
        Si tienes preguntas sobre esta política, puedes contactarnos en:{" "}
        <a
          href="mailto:encuadernacionartesanal@gmail.com"
          className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          encuadernacionartesanal@gmail.com
        </a>
      </p>
    ),
  },
  {
    number: "6",
    title: "Cambios",
    content:
      "Nos reservamos el derecho de actualizar esta política. Los cambios se publicarán en esta misma página.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-foreground" />
            <span className="font-heading font-semibold text-sm tracking-tight">Maqueteo Pro</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight mb-3">
            Política de Privacidad
          </h1>
          <p className="text-sm text-muted-foreground">
            Última actualización: 5 de julio de 2025
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.number} className="border-l-2 border-border pl-5">
              <h2 className="text-base font-semibold mb-2 flex items-baseline gap-2">
                <span className="text-xs font-mono text-muted-foreground">{section.number}.</span>
                {section.title}
              </h2>
              {section.content ? (
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              ) : (
                section.custom
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            ← Volver a Maqueteo Pro
          </Link>
        </div>
      </main>
    </div>
  );
}