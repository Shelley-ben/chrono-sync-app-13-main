import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, LogOut, Calendar as CalendarIcon, Plus, Eye, List, Grid, X, Menu, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMediaQuery } from '@/hooks/use-media-query';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color: string;
}

const EVENT_COLORS = [
  '#4285F4', // Google Blue
  '#34A853', // Google Green
  '#FBBC04', // Google Yellow
  '#EA4335', // Google Red
  '#8E44AD', // Purple
  '#00BCD4', // Cyan
  '#FF6B6B', // Coral
  '#4ECDC4', // Teal
];

type ViewMode = 'month' | 'week';

const Calendar = () => {
  const { user, logout } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [selectedColor, setSelectedColor] = useState(EVENT_COLORS[0]);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showEventsSheet, setShowEventsSheet] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getDaysInWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    
    return weekDays;
  };

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    }
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setIsDialogOpen(true);
  };

  const handleAddEvent = () => {
    if (!selectedDate || !eventTitle) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventTitle,
      description: eventDescription,
      date: selectedDate,
      time: eventTime,
      color: selectedColor,
    };

    setEvents([...events, newEvent]);
    toast.success('Event added successfully!');
    
    setEventTitle('');
    setEventDescription('');
    setEventTime('');
    setSelectedColor(EVENT_COLORS[0]);
    setIsDialogOpen(false);
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter((event) => event.date === dateStr);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    toast.success('Event deleted successfully!');
  };

  // Time picker logic from reference code
  const [timePickerDate, setTimePickerDate] = useState<Date>();

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string
  ) => {
    let newDate = timePickerDate;
    
    if (!newDate && selectedDate) {
      newDate = new Date(selectedDate);
    } else if (!newDate) {
      newDate = new Date();
    }

    if (type === "hour") {
      newDate.setHours(
        (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
      );
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      newDate.setHours(
        value === "PM" ? (currentHours % 12) + 12 : (currentHours % 12)
      );
    }
    
    setTimePickerDate(new Date(newDate));
    setEventTime(format(newDate, "hh:mm aa"));
  };

  const handleTimeSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setTimePickerDate(selectedDate);
      setEventTime(format(selectedDate, "hh:mm aa"));
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const weekDays = getDaysInWeek(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekName = `Week of ${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const allEvents = events.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare === 0) {
      return a.time.localeCompare(b.time);
    }
    return dateCompare;
  });

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1 flex-1">
      {Array.from({ length: startingDayOfWeek }).map((_, index) => (
        <div key={`empty-${index}`} className="aspect-square border border-border/50 rounded-lg bg-muted/20" />
      ))}
      
      {Array.from({ length: daysInMonth }).map((_, index) => {
        const day = index + 1;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayEvents = getEventsForDate(dateStr);
        const isToday = new Date().toDateString() === date.toDateString();
        const isHovered = hoveredDate === dateStr;

        return (
          <button
            key={day}
            onClick={() => handleDateClick(date)}
            onMouseEnter={() => setHoveredDate(dateStr)}
            onMouseLeave={() => setHoveredDate(null)}
            className={`
              aspect-square p-1 sm:p-2 rounded-lg border transition-all duration-200 relative
              border-border/50
              ${isToday 
                ? 'bg-primary/10 border-primary shadow-sm' 
                : 'bg-card'
              }
              ${isHovered 
                ? 'ring-2 ring-primary/30 shadow-lg scale-105 border-primary/70 z-10 bg-primary/5' 
                : 'hover:border-primary/40 hover:shadow-md'
              }
              group overflow-hidden
            `}
          >
            <div className="relative z-10 flex flex-col h-full">
              <span className={`
                text-sm font-medium transition-colors mb-1
                ${isToday 
                  ? 'text-primary' 
                  : isHovered 
                    ? 'text-primary' 
                    : 'text-foreground'
                }
              `}>
                {day}
              </span>
              
              {/* Events with colored labels */}
              {dayEvents.length > 0 && (
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayEvents.slice(0, isDesktop ? 3 : 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-[10px] sm:text-xs rounded px-1 py-0.5 truncate text-white font-medium shadow-sm"
                      style={{ 
                        backgroundColor: event.color,
                        borderLeft: `2px solid ${event.color}`
                      }}
                    >
                      {isDesktop && event.time && (
                        <span className="text-[10px] opacity-90 mr-1">
                          {event.time}
                        </span>
                      )}
                      {isDesktop ? event.title : event.title.substring(0, 8) + (event.title.length > 8 ? '...' : '')}
                    </div>
                  ))}
                  {dayEvents.length > (isDesktop ? 3 : 2) && (
                    <div className="text-[10px] sm:text-xs text-muted-foreground px-1">
                      +{dayEvents.length - (isDesktop ? 3 : 2)} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Plus icon overlay for empty days */}
            {dayEvents.length === 0 && (
              <div className={`
                absolute inset-0 flex items-center justify-center transition-all duration-200 z-20
                ${isHovered 
                  ? 'opacity-100 bg-primary/5 rounded-lg' 
                  : 'opacity-0'
                }
              `}>
                <Plus className={`
                  h-4 w-4 transition-transform duration-200
                  ${isHovered ? 'text-primary scale-110' : 'text-muted-foreground'}
                `} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = new Date().toDateString() === day.toDateString();
          const isHovered = hoveredDate === dateStr;
          
          return (
            <div 
              key={index} 
              className="text-center p-2 relative"
              onMouseEnter={() => setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <div className={`
                text-sm font-medium
                ${isToday ? 'text-primary' : 'text-foreground'}
              `}>
                {dayNames[index]}
              </div>
              <button
                onClick={() => handleDateClick(day)}
                className={`
                  text-lg font-semibold rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-all duration-200
                  ${isToday 
                    ? 'bg-primary text-primary-foreground' 
                    : isHovered
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-foreground hover:bg-accent'
                  }
                `}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1">
        {weekDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = getEventsForDate(dateStr);
          const isToday = new Date().toDateString() === day.toDateString();
          const isHovered = hoveredDate === dateStr;

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`
                rounded-lg border transition-all duration-200 relative min-h-[120px] p-2
                border-border/50
                ${isToday 
                  ? 'bg-primary/10 border-primary shadow-sm' 
                  : 'bg-card'
                }
                ${isHovered 
                  ? 'ring-2 ring-primary/30 shadow-lg border-primary/70 bg-primary/5' 
                  : 'hover:border-primary/40 hover:shadow-md'
                }
              `}
            >
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="text-xs rounded px-2 py-1 text-white font-medium shadow-sm truncate"
                    style={{ 
                      backgroundColor: event.color,
                      borderLeft: `3px solid ${event.color}`
                    }}
                  >
                    {event.time && (
                      <span className="text-xs opacity-90 mr-1">
                        {event.time}
                      </span>
                    )}
                    {event.title}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const EventsContent = () => (
    <div className="space-y-3">
      {allEvents.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No events yet. Create your first event!</p>
        </div>
      ) : (
        allEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div 
              className="w-3 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: event.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">{event.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEvent(event.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 ml-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground truncate">{event.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
                {event.time && (
                  <>
                    <span>•</span>
                    <span>{event.time}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-2 rounded-xl bg-primary/10">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Event Manager</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                {user?.email}
              </p>
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={() => setShowEventsSheet(true)}
              className="transition-smooth"
              disabled={events.length === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Events ({events.length})
            </Button>
            <Button variant="outline" onClick={handleLogout} className="transition-smooth">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button with direct actions */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="transition-smooth"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Calendar Card */}
        <Card className="glass p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-center sm:text-left">
              {viewMode === 'month' ? monthName : weekName}
            </h2>
            <div className="flex items-center justify-center sm:justify-end gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="transition-smooth h-8 px-2 sm:px-3"
                >
                  <Grid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Month</span>
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="transition-smooth h-8 px-2 sm:px-3"
                >
                  <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Week</span>
                </Button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-1 sm:gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevious} className="transition-smooth h-8 w-8">
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext} className="transition-smooth h-8 w-8">
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground p-1 sm:p-2">
                {isDesktop ? day : day.substring(0, 1)}
              </div>
            ))}
          </div>

          {/* Calendar View */}
          {viewMode === 'month' ? renderMonthView() : renderWeekView()}
        </Card>

        {/* Mobile View Events Button */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <Button 
            size="lg"
            onClick={() => setShowEventsSheet(true)}
            disabled={events.length === 0}
            className="rounded-full w-14 h-14 shadow-lg"
          >
            <Eye className="h-6 w-6" />
          </Button>
        </div>

        {/* Events Sheet for all screen sizes */}
        <Sheet open={showEventsSheet} onOpenChange={setShowEventsSheet}>
          <SheetContent aria-describedby={undefined} side={isDesktop ? "right" : "bottom"} className={cn(
            "sm:max-w-2xl",
            isDesktop ? "h-full" : "h-[90vh]"
          )}>
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>All Events ({events.length})</span>
                <Button variant="ghost" size="icon" onClick={() => setShowEventsSheet(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </SheetTitle>
            </SheetHeader>
            <div className={cn(
              "mt-4",
              isDesktop ? "h-[calc(100%-80px)]" : "h-[calc(100%-60px)]"
            )}>
              <ScrollArea className="h-full pr-4">
                <EventsContent />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>

        {/* Add Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent aria-describedby={undefined} className="glass max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Add Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !eventTime && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventTime ? eventTime : <span>Select time</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="sm:flex">
                      <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                        <ScrollArea className="w-64 sm:w-auto">
                          <div className="flex sm:flex-col p-2">
                            {hours.reverse().map((hour) => (
                              <Button
                                key={hour}
                                size="icon"
                                variant={
                                  timePickerDate && timePickerDate.getHours() % 12 === hour % 12
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() => handleTimeChange("hour", hour.toString())}
                              >
                                {hour}
                              </Button>
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="w-64 sm:w-auto">
                          <div className="flex sm:flex-col p-2">
                            {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                              <Button
                                key={minute}
                                size="icon"
                                variant={
                                  timePickerDate && timePickerDate.getMinutes() === minute
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() =>
                                  handleTimeChange("minute", minute.toString())
                                }
                              >
                                {minute.toString().padStart(2, '0')}
                              </Button>
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="">
                          <div className="flex sm:flex-col p-2">
                            {["AM", "PM"].map((ampm) => (
                              <Button
                                key={ampm}
                                size="icon"
                                variant={
                                  timePickerDate &&
                                  ((ampm === "AM" && timePickerDate.getHours() < 12) ||
                                    (ampm === "PM" && timePickerDate.getHours() >= 12))
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() => handleTimeChange("ampm", ampm)}
                              >
                                {ampm}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label>Event Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`
                        w-8 h-8 rounded-full border-2 transition-all duration-200
                        ${selectedColor === color 
                          ? 'border-foreground scale-110 ring-2 ring-primary/20' 
                          : 'border-transparent hover:scale-105'
                        }
                      `}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter event description"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleAddEvent} className="w-full transition-smooth">
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;