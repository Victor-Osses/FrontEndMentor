var currentUser;
var dataObj;

window.addEventListener('DOMContentLoaded', () => { getCurrentUser(), getComments() })

const getCurrentUser = async () =>{
    let uri = 'http://localhost:3000/currentUser'

    await fetch(uri, {
        method: 'GET'
    })
    .then((data) => data.json())
    .then((resp) => currentUser = resp)
    .catch((err) => console.log(err))
}

const getComments = async () =>{
    let uri = 'http://localhost:3000/comments'
    await fetch(uri, {
        method: 'GET'
    })
    .then((data) => data.json())
    .then((resp) => {
        dataObj = resp 
        commentsList(dataObj)
    })
    .catch((err) => console.log(err))
}

function insertTextContent(element, classes = [], datas = []){
    classes.forEach((className, index) => {
        element.querySelector(className).textContent = datas[index]
    })
}

function commentsList(comments){
    const commentsList = document.querySelector('#comments-list')
    const commentTemplate = document.querySelector('.template-comment')

    comments.forEach(comment => {
        const newComment = commentTemplate.cloneNode(true)

        insertTextContent(
            newComment, 
            ['.like-counts', '.name', '.time-ago', '.comment-text'],
            [comment.score, comment.user.username, comment.createdAt, comment.content]
        )

        newComment.querySelector('.avatar-image').setAttribute('src', comment.user.image.png)
        newComment.setAttribute('id', comment.id)
        newComment.querySelector('.btn-reply').addEventListener('click', (e) => createCommentForm(e, newComment, comment.user.username))
        newComment.querySelector('.add-like').addEventListener('click', (e) => addScore(newComment, e))
        newComment.querySelector('.add-dislike').addEventListener('click', (e) => subScore(newComment, e))

        newComment.classList.remove('hide');
       
        comment.replies.length > 0 
        ?
            repliesList(comment.replies, newComment)
        :
            false

        commentsList.appendChild(newComment)
    })
}

function repliesList(replies, newComment){
    const replyTemplate = document.querySelector('.reply-template')

    replies.forEach((reply) => {
        
        const newReply = replyTemplate.cloneNode(true)
        var replyList = newComment.querySelector('reply-list')
        
        if(replyList === null){
            replyList = document.createElement('ul')
            replyList.classList.add('reply-list')
            newComment.appendChild(replyList)
        }

        insertTextContent(
            newReply, 
            ['.like-counts', '.name', '.time-ago', '.comment-text', '.avatar-image'],
            [reply.score, reply.user.username, reply.createdAt]  
        )

        newReply.querySelector('.avatar-image').setAttribute('src', reply.user.image.png);
        newReply.querySelector('.comment-text').innerHTML = '<span class="replyingTo"> @' + reply.replyingTo + '</span> ' + reply.content;
        newReply.querySelector('.add-like').addEventListener('click', (e) => addScore(newReply, e))
        newReply.querySelector('.add-dislike').addEventListener('click', (e) => subScore(newReply, e))

        newReply.setAttribute('id', reply.id)
        newReply.classList.remove('hide')

        replyList.appendChild(newReply)

        newReply.querySelector('.btn-reply').addEventListener('click', (e) => createCommentForm(e, newReply.parentElement, reply.user.username))
    })
}

function createCommentForm(e, parentElement, userName){
    e.preventDefault()
    const commentForm = parentElement.querySelector('.comment-form-content') 
    console.log()

    if(commentForm === null){
        const commentFormTemplate = document.querySelector('.template-comment-form')
        const newCommentForm = commentFormTemplate.cloneNode(true);

        newCommentForm.classList.remove('template-comment-form');
        newCommentForm.classList.add('new-comment');
     
        newCommentForm.querySelector('.comment-input').value = '@' + userName + ' '
        newCommentForm.querySelector('.btn-send').addEventListener('click', (e) => insertNewComment(e, newCommentForm))
        
        parentElement.appendChild(newCommentForm)
        parentElement.querySelector('.comment-input').focus()
        
    }else{
        parentElement.removeChild(commentForm);
    }
}

async function insertNewComment(e, commentForm){
    e.preventDefault()
   
    dataObj.push({
        id: dataObj.length + 1, 
        content: commentForm.querySelector('.comment-input').value,
        createdAt: 'Few seconds ago',
        score: 0,
        user: {
            image: { 
              png: "./images/avatars/image-juliusomo.png",
              webp: "./images/avatars/image-juliusomo.webp"
            },
            username: "juliusomo"
          },
          replies: []
    })

    await fetch('http://localhost:3000/comments', {
        method: 'PUT',
        headers:{
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataObj)
    })
    .then((data) => data.json())
    .then((resp) =>  commentsList(resp))
    .catch((err) => console.log(err))
}

function addScore(comment, e){
    e.preventDefault()

    const score = comment.querySelector('.like-counts')

    if(!(score.classList.contains('liked'))){
        let point = 1;

        if(score.classList.contains('disliked')) {point += 1}

        score.textContent = point + Number(score.textContent)
        score.classList.add('liked')
        score.classList.remove('disliked')
    }else{
        score.classList.remove('liked')
        score.textContent = -1 + Number(score.textContent)
    }
}

async function subScore(comment, e){
    e.preventDefault()

    const score = comment.querySelector('.like-counts')

    if(!(score.classList.contains('disliked'))) {
        let point = -1;
        
        if(score.classList.contains('liked')) {point -= 1}

        score.textContent = point + Number(score.textContent)
        score.classList.add('disliked')
        score.classList.remove('liked')
    }else{
        score.classList.remove('disliked')
        score.textContent = 1 + Number(score.textContent)
    }

    //dataObj[commentId].score = Number(score.textContent)

    // try{
    //     await updateComment(dataObj)
    // }catch(err){
    //     console.log(`Erro: ${err}`)
    // }
}
