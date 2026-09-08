-- =============================================================================
-- Seed: 005_org_companies.sql
-- Entidad: org_companies
-- Descripción: Filiales Legales con Datos Fiscales (RUC SRI Ecuador)
-- =============================================================================
INSERT INTO org_companies (
  id, holding_id, country_code, currency_code,
  legal_name, trade_name, tax_id,
  legal_address, corporate_email, phone, website,
  metadata, is_active
) VALUES 
  (
    1, 1, 'EC', 'USD',
    'Worldclass Travel S.A.',
    'Worldclass Travel',
    '1792345678001',
    'Av. Amazonas N24-196 y Luis Cordero, Quito, Pichincha',
    'contacto@worldclass.ec',
    '+593 2 2500 100',
    'https://worldclass.ec',
    JSON_OBJECT(
      'social_networks', JSON_OBJECT(
        'instagram', 'https://instagram.com/worldclasstravel',
        'facebook',  'https://facebook.com/worldclasstravel',
        'linkedin',  'https://linkedin.com/company/worldclass-travel'
      ),
      'branding', JSON_OBJECT(
        'primary_color', '#1A56DB',
        'logo_url', 'https://cdn.worldclass.ec/logos/travel.png'
      )
    ),
    TRUE
  ),
  (
    2, 1, 'EC', 'USD',
    'RapiVisa S.A.',
    'RapiVisa',
    '1798765432001',
    'Av. 9 de Octubre 100 y Malecón Simón Bolívar, Guayaquil, Guayas',
    'info@rapivisa.ec',
    '+593 4 2300 200',
    'https://rapivisa.ec',
    JSON_OBJECT(
      'social_networks', JSON_OBJECT(
        'instagram', 'https://instagram.com/rapivisa',
        'facebook',  'https://facebook.com/rapivisa',
        'whatsapp',  '+5930987654321'
      ),
      'branding', JSON_OBJECT(
        'primary_color', '#E02424',
        'logo_url', 'https://cdn.rapivisa.ec/logos/rapivisa.png'
      )
    ),
    TRUE
  )
ON DUPLICATE KEY UPDATE legal_name = VALUES(legal_name);
