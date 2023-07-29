document.addEventListener('DOMContentLoaded', function() {

  // By default, load the inbox
  load_mailbox('inbox');

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.getElementById('compose-form').addEventListener('submit', function(event) {
        // Send email
        send_mail();
        setTimeout(() => {
          load_mailbox('sent');
        }, 50)
        event.preventDefault();
  });
  document.getElementById('button').addEventListener('click', function(event) {
        current_mail = document.getElementById('current_mail');
        archive_email(current_mail.dataset.mail_id, current_mail.dataset.archive);
        setTimeout(() => {
          load_mailbox('inbox');
        }, 100)
        //load_mailbox('inbox');
  });
  // Reply button
  document.getElementById('reply').addEventListener('click', function(event) {
        current_mail = document.getElementById('current_mail');
        reply_mail(current_mail);
  })
});


function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-content-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}


function view_email(email_id) {

    // Show email content and hide other views
    document.querySelector('#email-content-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    // Request email
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {

        console.log(email);
        // Display content
        const content = document.querySelector('#content');
        content.innerHTML = `<div class="info"><label>From:</label> ${email.sender}<br>
                            <label>To:</label> ${email.recipients}<br>
                            <label>Subject:</label> ${email.subject}<br>
                            <label>Timestamp:</label> ${email.timestamp}<br><hr>
                            <p>${email.body}</p>`;

        // labelling email id
        const current_mail = document.getElementById('current_mail');
        current_mail.dataset.mail_id = email.id;
        current_mail.dataset.archive = email.archived;
        current_mail.dataset.sender = email.sender;
        current_mail.dataset.subject = email.subject;
        current_mail.dataset.timestamp = email.timestamp;
        current_mail.dataset.body = email.body;

//        // Reply button
//        document.getElementById('reply').onclick = reply_mail(email);




    });

    // Mark status read
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
    })
}


function archive_email(id, value) {
    if (value == 'true') {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
                  archived: false
              })
        })
    } else {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
                  archived: true
              })
        })
    }
}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#email-content-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Archive button
  const button = document.getElementById("button");
  if (mailbox == "sent") {
    document.querySelector('#archive_button').style.display = 'none';
  } else {
    document.querySelector('#archive_button').style.display = 'block';
    if (mailbox == "inbox") {
        button.innerHTML = "Archive";
    }else {
        button.innerHTML = "Unarchive";
    }
  }

  // Request correct mails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

      Array.from(emails).forEach((email) => {
          // Create boxes
          const box = document.createElement('div');
          box.className = "boxes";
          document.querySelector('#emails-view').appendChild(box);

          // Mark read status
          if (email.read == true) {
              box.style.backgroundColor = "gray";
          }

          // View email
          box.addEventListener('click', () => view_email(email.id));

          // Create box content
          const address = document.createElement('div');
          address.className = "address";
          address.innerHTML = email.sender;
          box.appendChild(address);

          const subject = document.createElement('div');
          subject.className = "subject";
          subject.innerHTML = email.subject;
          box.appendChild(subject);

          const time = document.createElement('div');
          time.className = "time";
          time.innerHTML = email.timestamp;
          box.appendChild(time);

      })
  })
}


function send_mail() {
    // collect form data
    let recipients = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;

    // send email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
}


function reply_mail(current_mail){
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-content-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#new-email').style.display = 'none';

    // Pre-fill composition fields
    document.querySelector('#compose-recipients').value = current_mail.dataset.sender;
    if (document.querySelector('#compose-subject').value.startsWith('Re: ') ) {
        document.querySelector('#compose-subject').value = current_mail.dataset.subject;
    } else {
        document.querySelector('#compose-subject').value = 'Re: '+ current_mail.dataset.subject;
    }
    document.querySelector('#compose-body').value = 'On ' + current_mail.dataset.timestamp + ' ' +
      current_mail.dataset.sender + ' wrote: ' + current_mail.dataset.body + '\n';
}
