---
title: Accept imperfectness
date: 2024-03-17 23:35:48 +0800
url: /me/2024/03/17/imperfectness/
categories:
- me
---

The most important thing I learnt since the middle of 2023, after I returned from a long road trip to northwest China,
is to accept imperfectness.

<!--more-->

I started this post in March 2024 and left a sentence here: I'll summarize my new life OS setup with Logseq later.
Well, "later" took quite a long time. Now I am finally writing it down.
This is a summary of the system I rebuilt and how I use it today, not a guide to a perfect Logseq setup.

## Start again

I have ADHD. Getting started on a thing is difficult for me.
Knowing what I should do does not always help me start doing it.
If I also need to figure out the perfect way to do it before starting, things become even harder.

I used to rely on [doit.im][doit] for my GTD system.
In [my earlier post about practicing GTD with doit.im][old-gtd], written at the end of 2016,
I described how it helped me reduce anxiety, organize my goals, and make progress on work and study.
It was an important part of my daily life, not just a place to keep a shopping list.

Then doit.im went down for more than 10 days. My daily work was completely blocked.
I was angry, and created [a small project on GitHub][doit-export] to download all my data from it.
I got the data out, and tried to track my life with the raw JSON files.
That did not work well. Having all the tasks in a file was not the same as having a working GTD system.

During COVID-19, the Chinese government's lockdown rules brought me a dark time.
I did not accept being locked down. I broke the rules and went hiking and camping as much as possible,
trying to keep some of my life from before the lockdown.
But constantly fighting the rules and the people who wanted to stop me from going out burned me out.
I completely lost my pace and could not work or study normally.
Recovering my task data did not recover my routine.

I felt a bit hopeless. One thing became clear to me during that time: I cannot live locked down. I need freedom.

When I felt I could not keep living like that, I started a solo road trip.
I drove from Beijing to Luoyang and stayed with my parents for a few days, then headed northwest.
Through Xi'an and Lanzhou, with stops in small towns along the way, I eventually reached Xining.
I worked from hotels, but kept work to a minimum.
Sometimes I had no particular destination. I just drove, and found a hotel when it got dark.

Alisa flew to Xining, and we traveled around Gansu and Qinghai during her holiday.
After that, I continued driving through Ningxia and Inner Mongolia,
then followed the roads south of the Yinshan Mountains back toward Beijing.
Alisa joined me again by train for a weekend in Ulanqab, and we drove back to Beijing together.

At the closest point, I was only about 100 km from Xinjiang.
I did not go all the way there, but being able to drive freely to somewhere far away helped me feel like myself again.
The trip gave me enough energy to start rebuilding my daily life.

That was the background to my new GTD system and second brain in [Logseq][logseq].
The trip helped me recover the energy to start, and accepting imperfectness helped me actually do it.
I did not need to solve every problem with task management or note taking before I could use the system.
I needed somewhere to write things down, find the next action, and come back tomorrow.

## Why Logseq

After the experience with doit.im, I wanted control over my own data.
I did not want access to my tasks and notes to depend on whether a website was working.
My notebook is a file-based Logseq graph, with Markdown files for journals and pages.
I can read those files myself, even without Logseq.

I am also a fan of open-source software.
Obsidian looked like a better choice in many ways, but I chose Logseq because of its openness,
even though it had not reached version 1.0.
My fondness for Emacs also helped a little in making that choice.

Today, Obsidian seems to work better with AI. But my Logseq system works well for me too.
I do not need to switch just because another tool looks better in some ways.
I do not need a perfect tool now. I need one that works for me and lets me keep control of my data.

Of course, the JSON export already taught me that readable files alone are not enough.
I also need a workflow that I can actually use every day.

## The journal is the starting point

The screenshots below are from a separate demo graph using my setup, with fictional tasks, people, and notes.
None of the entries are from my real notebook.

Most things enter my notebook through the daily journal.
A template gives each day the same starting structure: reflection, reviews, today's work,
ongoing projects, an inbox, and a summary.
The reflection questions cover sleep, gratitude, habits, and ideas.

![Logseq daily journal with Today, ongoing projects, Inbox, and Summary sections, using fictional data](/images/logseq-journal-demo.png)

*The daily journal in the demo graph. Reflection and reviews are folded here.*

The template gives me a place to start. I do not have to design a new page every morning.
It also puts tasks, notes, and reflection in the same place, instead of asking me to maintain separate systems for each.

The journal is an inbox and an outliner, not a document that needs to be well organized before I can write in it.
A quick idea, a chat, a meeting note, or something I am reading can all start here.
If it becomes a larger topic later, I can create a page for it then.

## Capture, clarify, and organize

The task management part still follows GTD.

When something comes in, I put it under **Inbox** in the journal.
For items that still need clarification, I add an `#Inbox` tag to the top-level block.
The tag lets me find unprocessed items across journals, so I do not need to remember which day I wrote something down.

If I already know what to do with an item, I can capture and clarify it together.
There is no need to add the tag just to remove it a minute later.
For a small task that takes less than two minutes, I usually just do it.

When clarifying an item, I ask what the next action is:

- If I need to do it, make it a `TODO`.
- If it has a planned date or a deadline, add `SCHEDULED` or `DEADLINE`.
- If I am waiting for someone else, use `WAITING` and link the person.
- If I might do it someday, put it on my **Someday** page.
- If it is reference material, keep it as a note or create a page tagged `#Reference`.
- If it is a book or paper I want to read, create a page and mark it `#Unread`.
- If it is no longer useful, delete it, or just leave it in the journal without the `#Inbox` tag.

After clarification, I remove the `#Inbox` tag.
Not everything captured needs to become a task, and not everything needs to be kept forever.

For individual tasks, I create `TODO` blocks in the journal.
For tasks belonging to a project, I create them under the project block or on the project page.
Notes and references can stay under the task, close to the work they support.

I use priorities `A`, `B`, and `C` to help order the tasks.
When I start a task, I change it to `DOING`, and mark it `DONE` when finished.
I also use Logseq's time tracking to record work sessions.
For a task where all the work happens in subtasks, I can track time on the subtasks
and mark the parent complete when they are all done.

![Fictional camping project in Logseq with references, task states, priorities, scheduled dates, and a session note](/images/logseq-project-demo.png)

*A demo project: the tasks, references, and next-session note stay together.*

## Find the work, wherever I wrote it

A task can live in an old journal or on a project page.
I do not want to copy it into today's journal every morning just to remember it.
My custom queries bring these tasks back to the daily journal.

| Query | What I use it for |
| --- | --- |
| **NOW** | Tasks marked `DOING` or `NOW`. |
| **OVERDUE** | Unfinished tasks with scheduled dates or deadlines in the previous 365 days. |
| **DUE TODAY** | Open tasks scheduled or due today. |
| **NEXT** | Tasks without a scheduled date or deadline. |
| **WAITING** | Tasks waiting for someone or something else. |
| **TOMORROW**, **IN 7 DAYS**, **IN 30 DAYS** | A look at upcoming work. |

![Logseq queries gathering fictional in-progress, overdue, and due-today tasks, with upcoming lists folded](/images/logseq-task-queries-demo.png)

*Tasks from the demo project's page, an older journal, and the recurring reviews appear together.*

The queries sort results by priority. Some are grouped by page so I can see the project context.
I keep the immediate work visible and the longer lists collapsed.
My **Today** section reminds me to use these views and clarify the inbox.

This is how the journal and the project pages work together.
I can write a task where it makes sense, and still find it when it is time to do it.
There is only one task block to update, with its notes and history still attached.

## Goals, projects, and reviews

Daily tasks need some direction. Otherwise I can be busy without doing what matters to me.

I keep yearly OKR pages for my objectives and key results.
Objectives describe the direction, while key results should be measurable and time-bounded.
A key result can lead to one or more projects, and each project has tasks small enough to finish within a day.
I review the goals regularly and adjust the work around them.

I tag active projects with `#Ongoing`.
A query in the journal shows them together, even when their tasks and notes live on different pages.
I also keep [project checklists][project-checklists] for starting a project, completing it, and ending a work session.
Writing down the current status and the next step makes it easier to resume the work later.

Reviews are recurring tasks, not something I have to remember separately.
The journal template embeds references to these tasks, so I can use them from the journal
without creating another copy every day.

In the daily review, I check the inbox and the task lists.
At the end of the day, I write what I did toward my goals and how I feel.
The reflection questions also give me a record of sleep, gratitude, habits, and ideas.

In the weekly review, I look over my OKRs and ongoing projects, clear the inbox,
review the work and journals from the week, and plan the next week.
I also have a recurring review for my objectives and key results.

I still think review is more important than making a detailed plan.
A plan is based on what I know at the time. After doing some work, I know more, and things may have changed.
The review is where I make the system useful again.

## Notes and the second brain

I do not separate task management from note taking very much.
Reading creates questions and tasks. Working on a task creates notes and ideas.
Keeping them together makes it easier to use what I have written.

I tried the Zettelkasten method, but it did not fit my style, and I no longer use it.
Some of my older setup notes still describe that attempt.
Moving away from a method that does not work for me is also part of accepting imperfectness.

I borrow ideas from Cornell notes and *Building a Second Brain*,
but I do not need to follow a complete method just to take useful notes.

### Journals first, pages when needed

For small or random items, I use the journal.
This includes quick thoughts, reading notes, chats, ad-hoc meetings, and scrum meetings.
For a dedicated book, a larger topic, recurring meetings, or a more permanent output, I create a page.

I use page links and tags to connect things.
For example, a person has a page named `[[@Full Name]]`, which becomes a hub for related notes and tasks.
A topic tag works in a similar way. I can add aliases when needed.
Block references let me reuse a particular note without copying its content.

I do not need to decide the final structure at capture time.
If I am reading or thinking, writing the idea down is more important than deciding where it will live forever.

### Write to understand

A quick note can stay in the journal. If it needs follow-up, I can mark it as a task.
When reading a book or studying a topic, I can take notes under the reading task or on the related page,
and keep the source link so I can return to it later.
There is no required sequence of note types to work through.

When reviewing, I use the Cornell idea of writing questions and a short summary,
not just keeping the original facts.

The important step is writing in my own words.
A saved article is something I can read later. A note explaining what I understood is something I have already worked on.

If I plan to publish a note, I tag it `#Unpublished`.
After publishing, I can change the tag to `#Published` and add the public link.
That gives my blog writing a place in the same workflow, instead of making it a completely separate activity.

![Fictional reading page in Logseq with a reading task, notes, questions, a summary, and an Unpublished idea](/images/logseq-reading-notes-demo.png)

*A demo reading page, with questions and a summary in the same outline as the task.*

### Organize for use

I also borrow the PARA categories: Projects, Areas, Resources, and Archives.
In Logseq, I do not need to turn all of them into a strict folder hierarchy.
My ongoing projects, objectives, tags, and reference pages provide different ways to find the material.

The purpose is to support work and learning, not to collect the largest possible notebook.
I want to find something useful when a project needs it, connect it with what I know,
and eventually make something from it.
The organization can happen when it becomes useful, rather than becoming another requirement before I can start.

## Keep the manual part

So far, I have not let AI manage my Logseq notebook.
I still write the notes and track the tasks myself.

This is not because the manual process is perfect.
Writing a task, deciding its next action, and checking it off are part of how I keep track of my life.
Rewriting a note is also part of how I understand it.
For me, these are not just steps to remove so the notebook can be maintained faster.

The queries and templates help with finding and repeating things.
I still want to do the thinking and writing myself.
It works for me, and I do not need to replace a working process just because more automation is possible.

## Accept imperfectness

There are quite a few methods and names in this setup: GTD, OKR, PARA, Cornell notes.
But I do not have to think about all of them every time I open Logseq.
Most days, I open the journal, check the tasks, do some work, and write things down.

The system does not need every note to become a well-organized page,
every idea to become a project, or every plan to be completed exactly as written.
It needs to help me start and give me somewhere to return when I lose my pace.

That is what accepting imperfectness changed for me.
I could rebuild a system without first making it perfect, and keep using it while learning what works.

My Logseq setup is not perfect. But it works for me.
Finishing this post is part of the same practice.


[doit]:               https://doit.im/
[old-gtd]:            /me/2016/12/31/gtd-and-2016/
[doit-export]:        https://github.com/gnailuy/doit.im
[logseq]:             https://logseq.com/
[project-checklists]: /me/2026/10/04/project-checklists/

