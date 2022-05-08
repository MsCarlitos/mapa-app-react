import { SocketProvider } from "./context/SocketContext";
import { MapaPage } from "./pages/MapaPage";

const MapasApp = () => {
  return (
    <SocketProvider>
      <MapaPage />
    </SocketProvider>
  );
}

export default MapasApp;
