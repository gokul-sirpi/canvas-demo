//
import introJS from 'intro.js';
import styles from './styles.module.css';
import 'intro.js/introjs.css';
import { IntroStep } from 'intro.js/src/core/steps';

function Intro() {
  function getElementWithDataSelector(dataName: string) {
    return document.querySelector(
      `[data-intro=${dataName}]`
    ) as HTMLElement | null;
  }
  const steps: Partial<IntroStep>[] = [
    {
      title: 'hello intro',
      intro: '',
    },
    {
      element: getElementWithDataSelector('header'),
      intro: 'The header',
    },
    {
      element: getElementWithDataSelector('browse'),
      intro: 'browse through all the catalogue resources',
    },
  ];
  // function handleIntroExit() {}
  function handleIntroStart() {
    // setRunIntro(true);
    introJS().setOptions({ steps: steps }).start();
  }
  return (
    <div className={styles.container}>
      <button onClick={handleIntroStart} className={styles.intro_btn}>
        Intro
      </button>
    </div>
  );
}

export default Intro;
