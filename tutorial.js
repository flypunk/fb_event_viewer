var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    // Optimistically set a key on the new comment. It will be replaced by a
    // key generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    comment.key = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author} editor={comment.editor} key={comment.key}>
          {comment.text}
        </Comment>
      );
    });
      return (
        <div className="commentList">
          {commentNodes}
        </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: '', editor: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleEditorChange: function(e) {
    this.setState({editor: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    //e.defaultPrevented;
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    var editor = this.state.editor.trim();
    if (editor == '') {
      editor = 'Unknown heroic editor';
    }
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text, editor: editor});
    this.setState({author: '', text: ''});
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={this.state.author}
          onChange={this.handleAuthorChange}
        />
        <input
          type="text"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input
          type="text"
          placeholder="Who edited this?!"
          value={this.state.editor}
          onChange={this.handleEditorChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

/*
var Comment = React.createClass({
  render: function() {
    var md = new Remarkable();
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <h3 className="commentEditor">
          {'edited by: ' + this.props.editor}
        </h3>
        {md.render(this.props.children.toString())}
      </div>
    );
  }
});
*/

var Comment = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },

  render: function() {
    var md = new Remarkable();
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <h3 className="commentEditor">
          {'edited by: ' + this.props.editor}
        </h3>
        <span dangerouslySetInnerHTML={this.rawMarkup()}/>
      </div>
    );
  }
});

ReactDOM.render(
  <CommentBox url="/api/comments" pollInterval={2000} />,
  //<CommentBox url="/api/comments" />,
  document.getElementById('content')
)

