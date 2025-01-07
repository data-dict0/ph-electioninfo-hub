mapboxgl.accessToken =
  'pk.eyJ1IjoicG1hZ3R1bGlzMDciLCJhIjoiY2wzdTgyNzh0MjlqNjNjbTl4YWdyczE2aiJ9.OusPbpMc7Ue0YyVgHINiAA';
// Create a function to initialize the search functionality
function initializeSearch(map) {
  let searchData = [];
  
  // Fetch the GeoJSON data
  fetch('js/simplified_municipalities_voters.geojson')
    .then(response => response.json())
    .then(data => {
      // Process features to create searchable items
      searchData = data.features.map(feature => ({
        type: 'municipality',
        text: `${feature.properties.municipality}, ${feature.properties.province}`,
        municipality: feature.properties.municipality,
        province: feature.properties.province,
        coordinates: feature.geometry.type === 'Polygon' 
          ? feature.geometry.coordinates[0]
          : feature.geometry.coordinates[0][0],
        properties: feature.properties
      }));

      // Add unique provinces
      const provinces = [...new Set(searchData.map(item => item.province))];
      provinces.forEach(province => {
        const municipalitiesInProvince = searchData.filter(item => item.province === province);
        const allCoordinates = municipalitiesInProvince.flatMap(item => item.coordinates);
        
        searchData.push({
          type: 'province',
          text: province,
          province: province,
          coordinates: allCoordinates,
          properties: municipalitiesInProvince[0].properties
        });
      });
    });

  // Create search elements
  const searchContainer = document.createElement('div');
  searchContainer.className = 'mapbox-search-container';
  searchContainer.style.position = 'absolute';
  searchContainer.style.top = '10px';
  searchContainer.style.left = '10px';
  searchContainer.style.zIndex = '1';
  searchContainer.style.width = '300px';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search for a municipality...';
  searchInput.className = 'mapbox-search-input';
  searchInput.style.width = '100%';
  searchInput.style.padding = '10px';
  searchInput.style.border = '1px solid #ddd';
  searchInput.style.borderRadius = '4px';

  const searchResults = document.createElement('div');
  searchResults.className = 'mapbox-search-results';
  searchResults.style.display = 'none';
  searchResults.style.backgroundColor = 'white';
  searchResults.style.border = '1px solid #ddd';
  searchResults.style.borderRadius = '4px';
  searchResults.style.marginTop = '5px';
  searchResults.style.maxHeight = '200px';
  searchResults.style.overflowY = 'auto';

  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(searchResults);
  document.getElementById('map').appendChild(searchContainer);

  // Add search functionality
  searchInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    if (!value) {
      searchResults.style.display = 'none';
      return;
    }

    const matches = searchData.filter(item => 
      item.text.toLowerCase().includes(value)
    );

    searchResults.innerHTML = '';
    searchResults.style.display = matches.length ? 'block' : 'none';

    matches.slice(0, 5).forEach(item => {
      const div = document.createElement('div');
      div.className = 'mapbox-search-result';
      div.style.padding = '10px';
      div.style.cursor = 'pointer';
      div.style.borderBottom = '1px solid #eee';
      div.textContent = item.text;
      
      div.addEventListener('mouseover', () => {
        div.style.backgroundColor = '#f5f5f5';
      });
      
      div.addEventListener('mouseout', () => {
        div.style.backgroundColor = 'white';
      });

      div.addEventListener('click', () => {
        // Calculate bounds
        const bounds = new mapboxgl.LngLatBounds();
        item.coordinates.forEach(coord => {
          bounds.extend(coord);
        });

        // Fly to location
        map.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 1000
        });

        // Show popup
        new mapboxgl.Popup()
          .setLngLat(bounds.getCenter())
          .setHTML(
            item.type === 'province' 
              ? `<h5><strong>${item.province}</strong></h5>
                 <h5>Voter Turnout: ${item.properties.a2022_ave_voter_turnout.toFixed(2)}%</h5>`
              : `<h5><strong>${item.municipality}</strong> - ${item.province}</h5>
                 <h5>Voter Turnout: ${item.properties["2022_average_voter_turnout"].toFixed(2)}%</h5>`
          )
          .addTo(map);

        searchResults.style.display = 'none';
        searchInput.value = item.text;
      });

      searchResults.appendChild(div);
    });
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
}


 var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/pmagtulis07/cl47r8lhp001014n747gw9ltk',
  zoom: 4,
  maxZoom: 13,
  minZoom: 5,
  center: [122.104, 12.1],
});

map.touchZoomRotate.disableRotation();

map.dragRotate.disable();

// Add the search functionality after the map loads
map.on('load', function () {
  initializeSearch(map);
  
  // Rest of your existing map.on('load') code...
  map.resize();
  // ... (keep all your existing layer definitions and click handlers)
});


map.on('load', function () {
  map.resize();
  map.addLayer({
    id: 'provinces_outline',
    type: 'line',
    source: {
      type: 'geojson',
      data: 'js/simplified_provincial_voters.geojson',
    },
    paint: {
      'line-color': '#ffffff',
      'line-width': 0.7,
    },
  });
  map.addLayer(
    {
      id: 'provinces_voters',
      type: 'fill',
      source: {
        type: 'geojson',
        data: 'js/simplified_provincial_voters.geojson',
      },
      maxzoom: 6,
      minzoom: 3,
      paint: {
        'fill-color': [
          'match',
          ['get', 'prov_ave_turnout_2022_bins'],
          '65-70',
          '#e6f598',
          '71-75',
          '#ffffbf',
          '76-80',
          '#fee08b',
          '81-85',
          '#fdae61',
          '86-90',
          '#f46d43',
          '91-95',
          '#d53e4f',
          '96-100',
          '#9e0142',
          '#ffffff',
        ],
      },
    },
    'waterway-label'
  );

  map.addLayer(
    {
      id: 'municipalities_outline',
      type: 'line',
      source: {
        type: 'geojson',
        data: 'js/simplified_municipalities_voters.geojson',
      },
      paint: {
        'line-color': '#ffffff',
        'line-width': 0.25,
      },
    },
    'provinces_voters'
  );
  map.addLayer(
    {
      id: 'municipalities_voters',
      type: 'fill',
      source: {
        type: 'geojson',
        data: 'js/simplified_municipalities_voters.geojson',
      },
      minzoom: 6,
      maxzoom: 14,
      paint: {
        'fill-color': [
          'match',
          ['get', 'ave_turnout_2022_bins'],
          '45-50',
          '#5e4fa2',
          '51-55',
          '#3288bd',
          '56-60',
          '#66c2a5',
          '61-65',
          '#abdda4',
          '66-70',
          '#e6f598',
          '71-75',
          '#ffffbf',
          '76-80',
          '#fee08b',
          '81-85',
          '#fdae61',
          '86-90',
          '#f46d43',
          '91-95',
          '#d53e4f',
          '96-100',
          '#9e0142',
          '#ffffff',
        ],
      },
    },
    'municipalities_outline'
  );

  // Click handler for provinces
  map.on('click', 'provinces_voters', function (e) {
    const features = e.features[0];
    const provinceName = features.properties.province;
    
    // Query for municipalities in the clicked province
    const municipalityFeatures = map.querySourceFeatures('municipalities_voters', {
      sourceLayer: 'municipalities_voters',
      filter: ['==', ['get', 'province'], provinceName]
    });

    if (municipalityFeatures.length > 0) {
      // Calculate bounds
      const bounds = new mapboxgl.LngLatBounds();
      
      municipalityFeatures.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach(coord => {
            bounds.extend(coord);
          });
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(polygon => {
            polygon[0].forEach(coord => {
              bounds.extend(coord);
            });
          });
        }
      });

      // Fly to the bounds
      map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000
      });
    }

    // Show province-level popup
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `<h5><strong>${provinceName}</strong></h5>
         <h5>Voter Turnout: ${features.properties.a2022_ave_voter_turnout.toFixed(2)}%</h5>`
      )
      .addTo(map);
  });

  // Handle municipality clicks
  map.on('click', 'municipalities_voters', function (e) {
    const features = e.features[0];
    const municipalName = features.properties.municipality;
    const provinceName = features.properties.province;
    const voterTurnout = features.properties["2022_average_voter_turnout"].toFixed(2);
    const voterTurnout2019 = features.properties["2019_average_voter_turnout"].toFixed(2);
    const voterTurnoutmale = features.properties["2022_male_voter_turnout"].toFixed(2);
    const voterTurnoutfemale = features.properties["2022_female_voter_turnout"].toFixed(2);
    
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `<h5><strong>${municipalName}</strong> - ${provinceName}</h5>
         <h4>2022 Voter Turnout: ${voterTurnout}%</h4>
         <p>Male voter turnout: ${voterTurnoutmale}%</p>
         <p>Female voter turnout: ${voterTurnoutfemale}%</p><br>
         <p><em>2019: ${voterTurnout2019}%</em></p>`
      )
      .addTo(map);
  });

  // Cursor interactions
  map.on('mouseenter', 'provinces_voters', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'provinces_voters', () => {
    map.getCanvas().style.cursor = '';
  });

  map.on('mouseenter', 'municipalities_voters', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'municipalities_voters', () => {
    map.getCanvas().style.cursor = '';
  });
});