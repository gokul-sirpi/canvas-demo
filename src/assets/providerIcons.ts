interface ProviderIconMap {
  [key: string]: string;
}

export const providerIconMap: ProviderIconMap = {
  'Survey of India':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/soi-logo.jpg',
  'Niruthi Climate & Ecosystems Pvt Ltd':
    'https://adex.org.in/wp-content/uploads/2023/08/NIRUTHI-lOGO-3.png',
  'Open Data (Urban)':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/open_data.png',
  'Open Data (NASA)': 'assets/NASA_logo.png',
  'Thazhal Geospatial Analytics  ': 'assets/thazhal.jpeg',
  'Indian Council of Agricultural Research':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/ICAR.png',
  'Office of the Registrar General and Census Commissioner of India':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/ORGI.png',
  'Board Of Revenue, U.P.':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/Bor-up.png',
  'Geological Survey of India':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/gsi.jpeg',
  'Interdisciplinary Centre for Water Research (ICWaR)':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/icwar.png',
  'National Informatics Centre Goods and Services Tax Division':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/nic.png',
  'National Water Informatics Centre':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/nwic.png',
  'Open Data (OpenStreetMap)':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/Openstreetmap_logo.png',
  'India Meteorological Department':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/imd.png',
  'Central Ground Water Board':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/CGWB-logo.jpeg',
  'Food Corporation of India':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/FCI.png',
  'PM Gati Shakti developed by BISAG-N':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/pmgatishakti.png',
  'Forest Survey of India':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/fsi.png',
  'International Rice Research Institute':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/irri.png',
  'Remote Sensing Applications Centre, Uttar Pradesh':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/rsac.png',
  'National Remote Sensing Centre':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/nrsc.png',
  'ideaForge Technologies':
    'https://iudx-catalogue-assets.s3.ap-south-1.amazonaws.com/ugix/provider+logo/ideaForge.png',
};

export const getProviderIcon = (description: string): string => {
  return providerIconMap[description] || '/assets/humanitarian.png';
};
