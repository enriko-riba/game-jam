import { Global } from '.';
import { BootScene } from './scenes/BootScene';


/**
 *  Here we just preload fonts via google webfont.js
 *  after the fonts are loaded the bootstraper is taking over
 */

const PRELOAD_FONTS = [
                        'Permanent Marker',
                        'Orbitron',
                        'Farsan',
                    ];

//------------------------
// webfont loader config
//------------------------
console.log('initializing google webfont loader ...', PRELOAD_FONTS);
try {
    var cfg = {
        google: { families: PRELOAD_FONTS },
        active: () => {
            console.log('fonts preload finished!');          
            const scm = Global.getScm();
            const boot = new BootScene(scm);
            scm.AddScene(boot);
            scm.ActivateScene(boot);
        }
    };
    (window as any).WebFontConfig = cfg;
}
catch (e) {
    console.log(e);
}

//------------------------
// start webfont loader
//------------------------
/* jshint ignore:start */
{
    var src = ('https:' === document.location.protocol ? 'https' : 'http') +
               '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    var wf = document.createElement('script');
    wf.src = src;
    wf.type = 'text/javascript';
    wf.async = true;
    var s = document.getElementsByTagName('script')[0];
    if(s.parentNode)s.parentNode.insertBefore(wf, s);
};
/* jshint ignore:end */