import * as Tooltip from '@radix-ui/react-tooltip';
import { ReactElement } from 'react';
import styles from './styles.module.css';

function TooltipWrapper({
  children,
  content,
  side,
}: {
  children: ReactElement;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <>
      <Tooltip.Provider delayDuration={100}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side={side || 'top'}
              className={styles.tooltip_content}
              sideOffset={5}
            >
              {content}
              <Tooltip.Arrow className={styles.tooltip_arrow} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </>
  );
}

export default TooltipWrapper;
