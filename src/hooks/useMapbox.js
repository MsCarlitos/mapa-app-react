import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';
import mapboxgl from 'mapbox-gl';
import { Subject } from 'rxjs';

mapboxgl.accessToken = 'pk.eyJ1IjoibXNjYXJsaXRvcyIsImEiOiJjbDJ1dGM0eG0wNWJ2M2Rtdm80aTdtZ2c4In0.aqYFPKsplT9wVszggWpApQ';

export const useMapbox = (puntoInicial) => {

  const [coords, setCoords] = useState(puntoInicial);

  const mapa = useRef();
  const mapaDiv = useRef();
  const marcadores = useRef({});

  const setRef = useCallback((node) => {
    mapaDiv.current = node;
  }, []);

  const movimientoMarcador = useRef(new Subject());
  const nuevoMarcador = useRef(new Subject());

  const agregarMarcador = useCallback((ev, id) => {
    const { lng, lat } = ev.lngLat || ev;
    const marker = new mapboxgl.Marker();
    marker.id = id ?? v4();
    marker
      .setLngLat([lng, lat])
      .addTo(mapa.current)
      .setDraggable(true)
    marcadores.current[marker.id] = marker;

    if (!id) {
      nuevoMarcador.current.next({
        id: marker.id,
        lng,
        lat,
      });
    }

    marker.on('drag', (ev) => {
      const { id } = ev.target;
      const { lng, lat } = ev.target.getLngLat();
      movimientoMarcador.current.next({ id, lng, lat });
    })
  }, [])

  const actualizarPosicion = useCallback(({ id, lng, lat }) => {
    marcadores.current[id].setLngLat([lng, lat]);
  }, [])

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapaDiv.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [puntoInicial.lng, puntoInicial.lat],
      zoom: puntoInicial.zoom
    });
    mapa.current = map;

  }, [puntoInicial])

  useEffect(() => {
    mapa.current?.on('move', () => {
      const { lng, lat } = mapa.current.getCenter();
      setCoords({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: mapa.current.getZoom().toFixed(2)
      })
    });

  }, []);

  useEffect(() => {
    mapa.current?.on('click', agregarMarcador);
  }, [agregarMarcador])


  return {
    agregarMarcador,
    actualizarPosicion,
    coords,
    marcadores,
    nuevoMarcador$: nuevoMarcador.current,
    movimientoMarcador$: movimientoMarcador.current,
    setRef
  }
}
