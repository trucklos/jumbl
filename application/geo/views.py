from django.core.mail import send_mail, BadHeaderError
from django.http import HttpResponse, HttpResponseRedirect
import mapthing.settings

def send_email(request):
    gid = request.REQUEST.get('gid', '')
    name = request.REQUEST.get('name', '')
    email = request.REQUEST.get('email', '')
    picture = request.REQUEST.get('picture', '')

    subject = 'registration: ' + name + " " + gid
    message = 'name: ' + name + '\ngid: ' + gid + '\nemail: ' + email + '\npicture: ' + picture
    from_email = 'registration@jumbl.us'
    if subject and message and from_email:
        try:
            send_mail(subject, message, from_email, mapthing.settings.registration_email_recipients)
        except BadHeaderError:
            return HttpResponse('Invalid header found.')
        return HttpResponseRedirect('../approval.html')
    else:
        # In reality we'd use a form class
        # to get proper validation errors.
        return HttpResponse('Make sure all fields are entered and valid.')

