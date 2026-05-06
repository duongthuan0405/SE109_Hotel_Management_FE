import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function Calendar() {
  const [events, setEvents] = useState([
    {
      title: "Sample Event",
      start: new Date(),
      end: new Date(),
    },
  ]);


  const handleDateClick = (arg) => {
    alert(`Date clicked: ${arg.dateStr}`);
  };


  const handleEventClick = (arg) => {
    alert(`Event clicked: ${arg.event.title}`);
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground">
          View and manage events and bookings
        </p>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Event Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
          />
        </CardContent>
      </Card>
    </div>
  );
}

