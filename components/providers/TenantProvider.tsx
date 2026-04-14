"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OrganizationService, Organization } from '@/services/organizations';

interface TenantContextType {
  tenantId: string; // The slug (ingyemel, mjm)
  brandName: string;
  logoUrl: string | null;
  nit: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  organization: Organization | null;
  setTenantId: (id: string) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ 
  children,
  initialTenantId = 'ingyemel',
  initialOrganization = null
}: { 
  children: ReactNode;
  initialTenantId?: string;
  initialOrganization?: Organization | null;
}) {
  const [tenantId, setTenantId] = useState<string>(initialTenantId);
  const [brandName, setBrandName] = useState<string>(initialOrganization?.name || 'Ingyemel');
  const [logoUrl, setLogoUrl] = useState<string | null>(initialOrganization?.logo_url || null);
  const [nit, setNit] = useState<string | null>(initialOrganization?.nit || null);
  const [primaryColor, setPrimaryColor] = useState<string>(initialOrganization?.primary_color || '#f97316');
  const [secondaryColor, setSecondaryColor] = useState<string>(initialOrganization?.secondary_color || '#1e3a8a');
  const [accentColor, setAccentColor] = useState<string>(initialOrganization?.accent_color || '#f59e0b');
  const [organization, setOrganization] = useState<Organization | null>(initialOrganization);
  const [isLoading, setIsLoading] = useState(!initialOrganization);

  useEffect(() => {
    const detectTenant = async () => {
      try {
        const hostname = window.location.hostname;
        const searchParams = new URLSearchParams(window.location.search);
        const tenantParam = searchParams.get('tenant');

        let slug = 'ingyemel';

        if (tenantParam) {
          slug = tenantParam;
        } else if (hostname.includes('showcase')) {
          slug = 'showcase';
        } else if (hostname.includes('mjm') || hostname.includes('asesoriasintegralesmjm')) {
          slug = 'mjm';
        } else if (hostname.includes('ingyemel')) {
          slug = 'ingyemel';
        }

        setTenantId(slug);
        
        // Fetch organization details from Supabase
        const orgData = await OrganizationService.getBySlug(slug);
        
        if (orgData) {
          setOrganization(orgData);
          setBrandName(orgData.name);
          setLogoUrl(orgData.logo_url);
          setNit(orgData.nit);
          if (orgData.primary_color) setPrimaryColor(orgData.primary_color);
          if (orgData.secondary_color) setSecondaryColor(orgData.secondary_color);
          if (orgData.accent_color) setAccentColor(orgData.accent_color);
        } else {
          // Fallback if no org found in DB
          setBrandName(slug === 'showcase' ? 'Tu marca' : slug.charAt(0).toUpperCase() + slug.slice(1));
        }
        
      } catch (e) {
        console.error('Tenant detection failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    // If initialOrganization is provided from the server, skip client-side fetching
    if (initialOrganization) {
      if (!tenantId) {
        setTenantId(initialTenantId);
      }
      setIsLoading(false);
      return;
    }

    detectTenant();
  }, [tenantId, initialOrganization, initialTenantId]);

  return (
    <TenantContext.Provider value={{ 
      tenantId, 
      brandName, 
      logoUrl, 
      nit,
      primaryColor,
      secondaryColor,
      accentColor,
      organization,
      setTenantId, 
      isLoading 
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
