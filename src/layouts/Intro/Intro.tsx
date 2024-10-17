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
      title: 'Welcome',
      intro: 'Welcome to GSX canvas playground',
    },
    {
      element: getElementWithDataSelector('header'),
      title: '',
      intro:
        'The header element contains all necessary tools for the playground',
    },
    {
      element: getElementWithDataSelector('browse'),
      intro:
        'Browse through all the catalogue resources to plot on the playground',
    },
    {
      element: getElementWithDataSelector('ugix_layers'),
      intro:
        'Once a layer is added from the resources, a new configurable layer will be added here ',
    },
    {
      element: getElementWithDataSelector('drawing_tools'),
      intro:
        'These drawing tools allows you to draw variety of shapes in the playground',
    },
    {
      element: getElementWithDataSelector('add_marker'),
      intro: 'You can also drop markers on the map to indicate important areas',
    },
    {
      element: getElementWithDataSelector('user_layers'),
      intro:
        'Similar to Ugix layer, a user layer will be created upon using any of the drawing tools or the marker tool',
    },
    {
      element: getElementWithDataSelector('measure'),
      intro:
        'Similar to a line tool but measure tool does not persist after drawing',
    },
    {
      element: getElementWithDataSelector('select'),
      intro:
        'After choosing any of the drawing tools or marker or measure tool, you can use the select tool to change the mouse into default behavior',
    },
    {
      element: getElementWithDataSelector('base_layer'),
      intro: 'You can also change the base layer to suit your needs',
    },
    {
      element: getElementWithDataSelector('export_as'),
      intro:
        'Once data is plotted and features are drawn you can export all visible features as a geojson file or a jpg image',
    },
    {
      element: getElementWithDataSelector('import_as'),
      intro:
        'And those geojson files as well as any other properly formatted geojson or json file can be imported and plotted in the playground',
    },
    {
      element: getElementWithDataSelector('sign_out'),
      intro:
        'Once finished you can sign out or close the app, please be careful as your session cannot be restored once closed',
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
        Demo
      </button>
    </div>
  );
}

export default Intro;
