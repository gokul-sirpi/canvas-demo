import * as Popover from '@radix-ui/react-popover';
import { FaChevronDown } from 'react-icons/fa';
import TooltipWrapper from '../../components/tooltipWrapper/TooltipWrapper';
import DrawingTool from '../../components/drawingTool/DrawingTool';
import { useState } from 'react';
//
import styles from './styles.module.css';
import { drawType } from '../../types/UserLayer';

function DrawingTools() {
  const [selectedTool, setSelectedTool] = useState<drawType>('Circle');

  function selectDrawingTool(tool: drawType) {
    setSelectedTool(tool);
  }
  return (
    <Popover.Root>
      <div className={styles.popover_root} data-intro="drawing_tools">
        <Popover.Anchor>
          <TooltipWrapper content={selectedTool}>
            <span>
              <DrawingTool
                changeSelectedTool={selectDrawingTool}
                toolType={selectedTool}
              />
            </span>
          </TooltipWrapper>
        </Popover.Anchor>
        <TooltipWrapper content="Drawing tools">
          <Popover.Trigger asChild>
            <button className={styles.popover_trigger}>
              <FaChevronDown size={10} />
            </button>
          </Popover.Trigger>
        </TooltipWrapper>
        <Popover.Portal>
          <Popover.Content sideOffset={5} className={styles.popover_content}>
            <Popover.Arrow className={styles.popover_arrow} />
            <TooltipWrapper side="left" content="Circle">
              <span>
                <DrawingTool
                  changeSelectedTool={selectDrawingTool}
                  toolType="Circle"
                />
              </span>
            </TooltipWrapper>
            <TooltipWrapper side="left" content="Rectangle">
              <span>
                <DrawingTool
                  changeSelectedTool={selectDrawingTool}
                  toolType="Rectangle"
                />
              </span>
            </TooltipWrapper>
            <TooltipWrapper side="left" content="Polygon">
              <span>
                <DrawingTool
                  changeSelectedTool={selectDrawingTool}
                  toolType="Polygon"
                />
              </span>
            </TooltipWrapper>
            <TooltipWrapper side="left" content="Line">
              <span>
                <DrawingTool
                  changeSelectedTool={selectDrawingTool}
                  toolType="Line"
                />
              </span>
            </TooltipWrapper>
          </Popover.Content>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );
}

export default DrawingTools;
