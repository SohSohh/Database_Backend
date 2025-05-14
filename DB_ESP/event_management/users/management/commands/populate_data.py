import random
import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from faker import Faker

from users.models import Handler, Viewer, Membership
from events.models import Event, Category, Comment, Announcement

fake = Faker()

class Command(BaseCommand):
    help = 'Populates the database with bulk sample data'

    @transaction.atomic
    def handle(self, *args, **opts):
        self.clear_data()
        self.stdout.write(self.style.SUCCESS('Populating bulk data...'))
        handlers = self.create_handlers(18)
        viewers = self.create_viewers(120)
        self.create_memberships(handlers, viewers)
        categories = self.get_or_create_categories()
        events = self.create_events(handlers, categories, 90)
        self.add_attendees(events, viewers)
        self.create_comments(events, viewers, 350)
        self.create_announcements(handlers, 60)
        self.stdout.write(self.style.SUCCESS('Bulk data population complete.'))

    def clear_data(self):
        Announcement.objects.all().delete()
        Comment.objects.all().delete()
        Event.objects.all().delete()
        # Only delete the categories we create, not all
        Category.objects.filter(name__in=["Social", "Technology", "Workshop", "Volunteer"]).delete()
        Membership.objects.all().delete()
        Viewer.objects.all().delete()
        Handler.objects.all().delete()

    def create_handlers(self, count):
        society_names = [
            "Engineering Society", "Computer Science Society", "Business Association",
            "Law Society", "Medical Students Society", "Arts Club", "Film Society",
            "Photography Club", "Debate Team", "Chess Club", "Gaming Society", "Music Society",
            "Dance Club", "Drama Society", "International Students Association",
            "Environmental Society", "Volunteering Society", "Sports Union", "Entrepreneurship Club"
        ]
        handlers = []
        for i in range(count):
            name = society_names[i % len(society_names)]
            if i >= len(society_names):
                name = f"{name} {i // len(society_names) + 1}"
            username = f"{name.lower().replace(' ', '')}_{i+1}"
            email = f"{username}@example.com"
            handler = Handler.objects.create_user(
                username=username,
                email=email,
                password="password123",
                society_name=name
            )
            handler.generate_code()
            handlers.append(handler)
        return handlers

    def create_viewers(self, count):
        viewers = []
        for i in range(count):
            first = fake.first_name()
            last = fake.last_name()
            username = f"{first.lower()}{last.lower()}{i+1}"
            email = f"{username}@example.com"
            viewer = Viewer.objects.create_user(
                username=username,
                email=email,
                password="password123",
                first_name=first,
                last_name=last
            )
            viewers.append(viewer)
        return viewers

    def create_memberships(self, handlers, viewers):
        roles = ['executive', 'deputy_director', 'director', 'vice_president', 'president', 'other']
        for viewer in viewers:
            num = random.randint(2, min(6, len(handlers)))
            chosen = random.sample(handlers, num)
            for handler in chosen:
                role = random.choices(roles, weights=[10, 8, 5, 3, 1, 30])[0]
                Membership.objects.get_or_create(
                    viewer=viewer,
                    handler=handler,
                    defaults={'role': role}
                )

    def get_or_create_categories(self):
        # Only these four categories
        cats = [
            ("Social", "Parties, networking, mixers"),
            ("Technology", "Hackathons, coding, tech talks"),
            ("Workshop", "Hands-on learning and skill-building sessions"),
            ("Volunteer", "Community service and volunteering events"),
        ]
        objs = []
        for name, desc in cats:
            obj, _ = Category.objects.get_or_create(name=name, defaults={'description': desc})
            objs.append(obj)
        return objs

    def create_events(self, handlers, categories, count):
        locations = [
            "Main Auditorium", "Sports Hall", "Student Union", "Conference Room A",
            "Library", "Central Square", "Arts Center", "Great Hall",
            "Lecture Theater 1", "Outdoor Field", "Science Building", "Laboratory",
            "Virtual Meeting", "Town Hall", "Community Center", "Recreation Center"
        ]
        today = timezone.now().date()
        events = []
        themes = [
            "Workshop", "Seminar", "Meeting", "Conference", "Competition", "Festival",
            "Party", "Fundraiser", "Discussion", "Showcase", "Exhibition", "Performance",
            "Training", "Course", "Lecture", "Panel"
        ]
        for i in range(count):
            host = random.choice(handlers)
            category = random.choice(categories)
            location = random.choice(locations)
            if random.random() < 0.7:
                date = today + datetime.timedelta(days=random.randint(0, 90))
            else:
                date = today - datetime.timedelta(days=random.randint(1, 30))
            hour = random.randint(9, 19)
            minute = random.choice([0, 15, 30, 45])
            start_time = datetime.time(hour, minute)
            duration = random.randint(1, 4)
            end_hour = min(hour + duration, 23)
            end_time = datetime.time(end_hour, minute)
            theme = random.choice(themes)
            name = f"{host.society_name} {theme} - {category.name}"
            description = fake.paragraph(nb_sentences=6)
            event = Event.objects.create(
                name=name,
                host=host,
                start_time=start_time,
                end_time=end_time,
                date=date,
                location=location,
                description=description,
                banner=None,
                category=category
            )
            events.append(event)
        return events

    def add_attendees(self, events, viewers):
        for event in events:
            num = int(len(viewers) * random.uniform(0.25, 0.85))
            attendees = random.sample(viewers, num)
            event.attendees.add(*attendees)

    def create_comments(self, events, viewers, count):
        today = timezone.now().date()
        past_events = [e for e in events if e.date < today]
        if not past_events:
            return
        for _ in range(count):
            event = random.choice(past_events)
            attendees = list(event.attendees.all())
            if not attendees:
                continue
            user = random.choice(attendees)
            content = fake.paragraph(nb_sentences=random.randint(1, 4))
            rating = random.choices([1, 2, 3, 4, 5], weights=[5, 10, 15, 35, 35])[0]
            event_date = event.date
            days_after = random.randint(1, 10)
            comment_date = datetime.datetime.combine(
                event_date, datetime.time(hour=12, minute=0)
            ) + datetime.timedelta(days=days_after)
            if comment_date.date() > today:
                comment_date = timezone.now() - datetime.timedelta(days=random.randint(1, 3))
            Comment.objects.create(
                event=event,
                user=user,
                content=content,
                rating=rating,
                created_at=comment_date
            )

    def create_announcements(self, handlers, count):
        today = timezone.now().date()
        title_templates = [
            "Important Announcement: {topic}",
            "Upcoming Event: {topic}",
            "Notice: {topic}",
            "Registration Open for {topic}",
            "Update on {topic}",
            "Reminder: {topic}",
            "New Opportunity: {topic}",
            "Change in Schedule: {topic}",
            "{topic} - Information",
            "Call for Participants: {topic}"
        ]
        topics = [
            "Annual General Meeting", "Leadership Elections", "Workshop Series",
            "Membership Renewal", "Guest Speaker Session", "Fundraising Campaign",
            "Social Event", "Collaboration Opportunity", "Community Service",
            "Industry Visit", "Conference Registration", "Committee Formation",
            "Competition Details", "Society Awards", "Holiday Schedule", "Venue Change"
        ]
        for _ in range(count):
            host = random.choice(handlers)
            title = random.choice(title_templates).format(topic=random.choice(topics))
            description = "\n\n".join([fake.paragraph(nb_sentences=random.randint(3, 5)) for _ in range(random.randint(1, 2))])
            if random.random() < 0.7:
                days_ago = random.randint(0, 14)
            else:
                days_ago = random.randint(15, 60)
            date_made = timezone.now() - datetime.timedelta(days=days_ago)
            Announcement.objects.create(
                title=title,
                host=host,
                description=description,
                date_made=date_made
            )
