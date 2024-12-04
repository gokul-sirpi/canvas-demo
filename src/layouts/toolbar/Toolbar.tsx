import TooltipWrapper from '../../components/tooltipWrapper/TooltipWrapper';
import BrowseDataDialog from '../browseDataDialog/BrowseDataDialog';
import DrawingTool from '../../components/drawingTool/DrawingTool';
import DrawingTools from '../drawingTools/DrawingTools';
import BaseMaps from '../../components/basemaps/BaseMaps';
import ExportDataDialog from '../../components/exportDataDialog/ExportDataDialog';
import ImportDataInput from '../../components/importDataInput/ImportDataInput';
import SwipeDialog from '../../components/swipeDialog/SwipeDialog';
import styles from './styles.module.css';
import { Resource } from '../../types/resource';

export default function Toolbar({
  resourceList,
}: {
  resourceList: Resource[];
}) {
  return (
    <div data-intro="header" className={styles.tools_container}>
      <TooltipWrapper content="Browse GDI  resources">
        <span data-intro="browse">
          <BrowseDataDialog resourceList={resourceList} />
        </span>
      </TooltipWrapper>
      <TooltipWrapper content="Select">
        <span data-intro="select">
          <DrawingTool toolType="Cursor" />
        </span>
      </TooltipWrapper>
      <DrawingTools />
      <TooltipWrapper content="Add marker">
        <span data-intro="add_marker">
          <DrawingTool toolType="Point" />
        </span>
      </TooltipWrapper>
      <TooltipWrapper content="Measure distance">
        <span data-intro="measure">
          <DrawingTool toolType="Measure" />
        </span>
      </TooltipWrapper>
      <BaseMaps />
      <ExportDataDialog />
      <ImportDataInput />
      <TooltipWrapper content="Add swipe layer">
        <span data-intro="measure">
          <SwipeDialog />
        </span>
      </TooltipWrapper>
    </div>
  );
}
