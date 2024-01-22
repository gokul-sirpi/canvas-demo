import { FaRegCircle } from 'react-icons/fa';
import ol_map from '../../lib/openLayers';

//
function Tools() {
  function drawBbox() {
    ol_map.drawBbox('Circle');
  }
  return (
    <div>
      <button onClick={drawBbox}>
        <FaRegCircle size={40} />
      </button>
    </div>
  );
}

export default Tools;
