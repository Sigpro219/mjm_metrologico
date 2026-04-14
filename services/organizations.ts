import { supabase } from "@/lib/supabase";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  nit: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  organization_id: string | null;
}

export const OrganizationService = {
  async getBySlug(slug: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      // Improved error logging for Supabase response
      const errorMessage = error.message || 'Error desconocido';
      const errorCode = (error as unknown as Record<string, unknown>).code as string || 'N/C';
      console.error(`Error fetching organization [${slug}]: code=${errorCode}, message=${errorMessage}`, error);
      return null;
    }

    return data as Organization;
  },

  async update(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    const { data, error } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating organization ${id}:`, error);
      throw error;
    }

    return data as Organization;
  },

  async uploadLogo(organizationId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo.${fileExt}`;
    const filePath = `${organizationId}/${fileName}`;

    // Upsert the file
    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, file, { 
        upsert: true,
        cacheControl: '0'
      });

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
