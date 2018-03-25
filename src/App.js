import React, { Component } from 'react';
import marked from 'marked';
import js_beautify from 'js-beautify';
import {
  ContentState,
  Editor,
  EditorState,
  convertToRaw,
  convertFromRaw,
  convertFromHTML
} from 'draft-js';
import 'draft-js/dist/Draft.css';

import { stateFromHTML } from 'draft-js-import-html';

import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      jsVersion: '',
    }
  }

  onChange = (editorString) => {
    const renderer = new marked.Renderer();

    renderer.heading = (text, level) => {
      switch (level) {
        case 1:
          return `<Title>${text}</Title>\n\n`;
        case 2:
          return `<Heading>${text}</Heading>\n\n`;
        case 3:
          return `<SubHeading>${text}</SubHeading>\n\n`;
        default:
          return `<h${level}>${text}</h${level}>\n\n`;
      }
    }

    renderer.hr = () => {
      return '\n<Divider />\n';
    }

    renderer.code = (code, language) => {
      return `\n\n<Code language="${language}">\n  \{\`\n${code}\n  \`\}\n</Code>\n`;
    }

    renderer.list = (body, ordered) => {
      return `\n<List>\n${body}\n</List>\n`;
    }

    renderer.listitem = (text) => {
      return `<Item>\n${text}\n</Item>`;
    }

    renderer.paragraph = (text) => {
      return `<Text>${text}</Text>\n`;
    }

    renderer.image = (href, title, text) => {
      return `<Img src="${href}" title={${title}} alt={${text}} />\n`;
    }

    renderer.strong = (text) => {
      return `<Bold>${text}</Bold>`;
    }

    renderer.em = (text) => {
      return `<Italic>${text}</Italic>`;
    }

    renderer.codespan = (code) => {
      return `<InlineCode>${code}</InlineCode>`;
    }

    renderer.link = (href, title, text) => {
      return `<Link href="${href}">${text}</Link>`;
    }

    const markedRendered = js_beautify.html(
      marked(editorString, { renderer: renderer }),
      {
        "indent_size": 2,
      },
    );

    this.setState({
      jsVersion: markedRendered,
    })
  }

  render() {
    const { jsVersion } = this.state;

    return (
      <div className="App">
        <JSMDEditor
          id="md"
          placeholder="Your markdown"
          onChangeParent={this.onChange}
        />

        <pre id="js">{jsVersion}</pre>
      </div>
    );
  }
}

export default App;

class JSMDEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty()
    };
  }

  onChange = (editorState) => {
    const bigString = convertToRaw(editorState.getCurrentContent()).blocks.map(block => {
      return block.text;
    }).join("\n");

    if (this.props.onChangeParent) {
      this.props.onChangeParent(bigString);
    }

    this.setState({
      editorState,
    });
  }

  render() {
    const { placeholder, id } = this.props;

    return (
      <div id={id}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          placeholder={placeholder}
          ref={'editor'}
        />
      </div>
    );
  }
}
