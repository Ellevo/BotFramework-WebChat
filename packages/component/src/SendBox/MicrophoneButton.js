import { Composer as DictateComposer } from 'react-dictate-button';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectWithContext from '../connectWithContext';
import IconButton from './IconButton';
import Localize from '../Localization/Localize';
import MicrophoneIcon from './Assets/MicrophoneIcon';

const IDLE = 0;
const STARTING = 1;
const DICTATING = 2;
const STOPPING = 3;

const ROOT_CSS = css({
  display: 'flex',

  '& > .dictation': {
    alignItems: 'center',
    display: 'flex',
    flex: 1
  }
});

class MicrophoneButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleDictate = this.handleDictate.bind(this);
    this.handleDictating = this.handleDictating.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleMicrophoneClick = this.handleClick.bind(this);

    this.state = {
      readyState: IDLE,
      interims: []
    };
  }

  componentWillReceiveProps({ speechState: nextSpeechState }) {
    const { speechState } = this.props;

    if (!speechState && nextSpeechState) {
      // Turned on speech
      this.setState(({ readyState }) => {
        if (readyState !== STARTING && readyState !== DICTATING) {
          return { readyState: STARTING };
        }
      });
    } else if (speechState && !nextSpeechState) {
      // Turned off speech
      this.setState(({ readyState }) => {
        if (readyState === STARTING || readyState === DICTATING) {
          return { readyState: STOPPING };
        }
      });
    }
  }

  handleClick() {
    const { props } = this;

    if (props.speechState) {
      props.stopSpeechInput();
    } else {
      props.startSpeechInput();
    }

    props.onClick && props.onClick();
  }

  handleDictate({ result: { transcript } = {} }) {
    const { props } = this;

    this.setState(() => ({
      interims: [],
      readyState: IDLE
    }));

    props.stopSpeechInput();

    if (transcript) {
      props.setSendBox(transcript, 'speech');
      props.submitSendBox('speech');
      props.startSpeakingActivity();
    }
  }

  handleDictating({ results = [] }) {
    const { props } = this;
    const interims = results.map(({ transcript }) => transcript);

    this.setState(() => ({
      interims,
      readyState: DICTATING
    }));

    // This is for two purposes:
    // 1. Set send box will also trigger send typing
    // 2. If the user cancelled out, the interim result will be in the send box so the user can update it before send
    props.setSendBox(interims.join(' '), 'speech');
  }

  handleError(event) {
    const { props } = this;

    this.setState(() => ({
      readyState: IDLE
    }));

    props.stopSpeechInput();
    props.onError && props.onError(event);
  }

  render() {
    const {
      props: { className, disabled, speechState, styleSet, webSpeechPonyfill },
      state: { interims, readyState }
    } = this;

    // TODO: [P3] After speech started, when clicking on the transcript, it should
    //       stop the dictation and allow the user to type-correct the transcript

    return (
      <DictateComposer
        onDictate={ this.handleDictate }
        onError={ this.handleError }
        onProgress={ this.handleDictating }
        speechRecognition={ webSpeechPonyfill && webSpeechPonyfill.SpeechRecognition }
        speechGrammarList={ webSpeechPonyfill && webSpeechPonyfill.SpeechGrammarList }
        started={ !disabled && (readyState === STARTING || readyState === DICTATING) }
      >
        { () =>
          <div className={ classNames(
            styleSet.microphoneButton + '',
            ROOT_CSS + '',
            (className || '') + '',
            { dictating: readyState === DICTATING }
          ) }>
            { !!speechState && (
                interims.length ?
                  <p className="dictation interims">
                    { interims.map((interim, index) => <span key={ index }>{ interim }</span>) }
                  </p>
                :
                  <p className="dictation status"><Localize text="Listening&hellip;" /></p>
            ) }
            <IconButton
              disabled={ disabled || (readyState === STARTING || readyState === STOPPING) }
              onClick={ this.handleClick }
            >
              <MicrophoneIcon />
            </IconButton>
          </div>
        }
      </DictateComposer>
    );
  }
}

export default connectWithContext(
  ({ input: { speechState } }) => ({ speechState }),
  ({
    disabled,
    setSendBox,
    startSpeakingActivity,
    startSpeechInput,
    stopSpeechInput,
    submitSendBox,
    styleSet,
    webSpeechPonyfill
  }) => ({
    disabled,
    setSendBox,
    startSpeakingActivity,
    startSpeechInput,
    stopSpeechInput,
    submitSendBox,
    styleSet,
    webSpeechPonyfill
  })
)(MicrophoneButton)
