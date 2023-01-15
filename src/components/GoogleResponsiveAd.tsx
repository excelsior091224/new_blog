import React from 'react';
import {Adsense} from '@ctrl/react-adsense';

const DisplayAd = () => {
    return (
        <Adsense
            client="ca-pub-9621814408753320"
            slot="8896961597"
            style={{ display: 'block' }}
            format="auto"
            responsive="true"
        />
    );
};

export default DisplayAd;