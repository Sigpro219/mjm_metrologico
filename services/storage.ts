import { supabase } from '@/lib/supabase';

export const storageService = {
  getBrandAssetUrl(organizationId: string, path: string) {
    const { data } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(`${organizationId}/${path}`);
    
    // Add a simple cache buster (timestamp) to bypass CDN/Browser cache
    const cacheBuster = `?t=${new Date().getTime()}`;
    return `${data.publicUrl}${cacheBuster}`;
  },

  async getLogoUrl(organizationId: string) {
    // Attempt to find logo.png or logo.PNG in the org folder
    const { data: list } = await supabase.storage
      .from('brand-assets')
      .list(organizationId);
    
    const logoFile = list?.find(f => f.name.toLowerCase().startsWith('logo.'));
    
    if (logoFile) {
      return this.getBrandAssetUrl(organizationId, logoFile.name);
    }

    // Default return (will show broken if not found, which is better for debugging)
    return this.getBrandAssetUrl(organizationId, 'logo.png');
  },

  async getUIAssetUrl(organizationId: string, assetName: string) {
    return this.getBrandAssetUrl(organizationId, `ui/${assetName}`);
  },

  async listClientLogos(organizationId: string) {
    const { data, error } = await supabase.storage
      .from('brand-assets')
      .list(`${organizationId}/clients`);

    if (error || !data) {
      console.error('Error fetching client logos:', error);
      return [];
    }

    return data
      .filter(file => file.id) // Only files
      .map(file => this.getBrandAssetUrl(organizationId, `clients/${file.name}`));
  },

  async getHeroAssetUrl(organizationId: string, assetName: string) {
    return this.getBrandAssetUrl(organizationId, `hero/${assetName}`);
  }
};
