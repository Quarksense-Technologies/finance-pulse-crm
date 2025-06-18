
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProjectResourceAllocation } from '@/data/types';

interface AttendanceFormProps {
  projectId: string;
  resources: ProjectResourceAllocation[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const AttendanceForm = ({ projectId, resources, onSubmit, onCancel }: AttendanceFormProps) => {
  const [selectedAllocationId, setSelectedAllocationId] = useState('');
  const [date, setDate] = useState<Date>();
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAllocationId || !date || !checkInTime || !checkOutTime) {
      return;
    }

    onSubmit({
      projectResourceId: selectedAllocationId,
      date: date.toISOString().split('T')[0],
      checkInTime,
      checkOutTime
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="resource">Resource</Label>
        <Select value={selectedAllocationId} onValueChange={setSelectedAllocationId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a resource" />
          </SelectTrigger>
          <SelectContent>
            {resources.map((allocation) => (
              <SelectItem key={allocation.id} value={allocation.id}>
                {allocation.resource?.name} - {allocation.resource?.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="checkIn">Check In Time</Label>
          <Input
            id="checkIn"
            type="time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkOut">Check Out Time</Label>
          <Input
            id="checkOut"
            type="time"
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!selectedAllocationId || !date || !checkInTime || !checkOutTime}
        >
          Record Attendance
        </Button>
      </div>
    </form>
  );
};

export default AttendanceForm;
