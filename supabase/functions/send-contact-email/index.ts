import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactEmailRequest = await req.json();

    console.log("Processing contact form submission:", { name, email, subject });

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "Club de Fútbol <onboarding@resend.dev>",
      to: [email],
      subject: "Hemos recibido tu mensaje",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a472a; margin-bottom: 20px;">¡Gracias por contactarnos, ${name}!</h1>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 15px;">
            Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #1a472a; margin-top: 0;">Resumen de tu consulta:</h3>
            <p><strong>Asunto:</strong> ${subject}</p>
            <p><strong>Mensaje:</strong> ${message}</p>
            ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}
          </div>
          
          <p style="color: #333; line-height: 1.6;">
            Nuestro equipo revisará tu consulta y te responderemos en un plazo de 24-48 horas.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px;">
            Saludos cordiales,<br>
            <strong>Club de Fútbol</strong><br>
            Equipos Adultos A, Adultos B, Senior y Super Senior
          </p>
        </div>
      `,
    });

    // Send notification email to club administrators
    const adminEmailResponse = await resend.emails.send({
      from: "Formulario de Contacto <onboarding@resend.dev>",
      to: ["admin@clubdefutbol.com"], // Replace with actual admin email
      subject: `Nueva consulta: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a472a; margin-bottom: 20px;">Nueva consulta desde el sitio web</h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #1a472a; margin-top: 0;">Datos del contacto:</h3>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}
            <p><strong>Asunto:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="color: #1a472a; margin-top: 0;">Mensaje:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Mensaje recibido el ${new Date().toLocaleString('es-ES')}
          </p>
        </div>
      `,
    });

    console.log("User confirmation email sent:", userEmailResponse);
    console.log("Admin notification email sent:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Emails sent successfully",
        userEmailId: userEmailResponse.data?.id,
        adminEmailId: adminEmailResponse.data?.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);