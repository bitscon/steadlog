import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnimalForm } from '@/features/health/AnimalForm';
import { MedicationForm } from '@/features/health/MedicationForm';
import { GroomingScheduleForm } from '@/features/health/GroomingScheduleForm';
import {
  getAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  Animal,
  AnimalInsert,
} from '@/features/animals/api';
import {
  getMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  Medication,
  MedicationInsert,
} from '@/features/health/medicationsApi';
import {
  getGroomingSchedules,
  getGroomingRecords,
  createGroomingSchedule,
  updateGroomingSchedule,
  deleteGroomingSchedule,
  GroomingSchedule,
  GroomingScheduleInsert,
  GroomingRecord,
} from '@/features/health/groomingApi';
import { calculateDosage, formatDosage } from '@/features/health/dosageCalculator';
import { getProperties, Property } from '@/features/properties/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TabHeader } from '@/components/ui/TabHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Settings, Edit2, Trash2, Bird, Pill, Search, Calculator, AlertTriangle, Scissors, Calendar, History } from 'lucide-react';
import { format, addDays, parseISO, differenceInDays } from 'date-fns';
import { awardXP } from '@/game/gameEngine';

export default function HealthHub() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [groomingSchedules, setGroomingSchedules] = useState<GroomingSchedule[]>([]);
  const [groomingRecords, setGroomingRecords] = useState<GroomingRecord[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<GroomingSchedule | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [medicationFormOpen, setMedicationFormOpen] = useState(false);
  const [groomingFormOpen, setGroomingFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('animals');
  const [groomingTab, setGroomingTab] = useState('upcoming');
  const [medicationSearch, setMedicationSearch] = useState('');
  
  // Dosage calculator state
  const [dosageAnimal, setDosageAnimal] = useState<string>('');
  const [dosageMedication, setDosageMedication] = useState<string>('');
  const [dosageWeight, setDosageWeight] = useState<string>('');
  const [calculatedDose, setCalculatedDose] = useState<number | null>(null);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [animalsData, propertiesData, medicationsData, schedulesData, recordsData] = await Promise.all([
        getAnimals(user.id),
        getProperties(user.id),
        getMedications(user.id),
        getGroomingSchedules(user.id),
        getGroomingRecords(user.id),
      ]);
      setAnimals(animalsData);
      setProperties(propertiesData);
      setMedications(medicationsData);
      setGroomingSchedules(schedulesData);
      setGroomingRecords(recordsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSubmit = async (data: AnimalInsert) => {
    if (!user?.id) return;

    try {
      if (selectedAnimal) {
        const updated = await updateAnimal(selectedAnimal.id, user.id, data);
        setAnimals(animals.map((a) => (a.id === updated.id ? updated : a)));
        toast({
          title: 'Success',
          description: 'Animal updated successfully',
        });
      } else {
        const newAnimal = await createAnimal(user.id, data);
        setAnimals([newAnimal, ...animals]);
        
        // Award XP for animal creation
        awardXP('animal_added', 20, { animalId: newAnimal.id }).catch((err) => {
          console.error('[HealthHub] Failed to award XP:', err);
        });
        
        toast({
          title: 'Success',
          description: 'Animal added successfully',
        });
      }
      setSelectedAnimal(null);
      setFormOpen(false);
    } catch (error) {
      console.error('[HealthHub] Error saving animal:', error);
      toast({
        title: 'Error',
        description: `Failed to ${selectedAnimal ? 'update' : 'add'} animal`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleMedicationSubmit = async (data: MedicationInsert) => {
    if (!user?.id) return;

    try {
      if (selectedMedication) {
        const updated = await updateMedication(selectedMedication.id, user.id, data);
        setMedications(medications.map((m) => (m.id === updated.id ? updated : m)));
        toast({
          title: 'Success',
          description: 'Medication updated successfully',
        });
      } else {
        const newMedication = await createMedication(user.id, data);
        setMedications([newMedication, ...medications]);
        toast({
          title: 'Success',
          description: 'Medication added successfully',
        });
      }
      setSelectedMedication(null);
      setMedicationFormOpen(false);
    } catch (error) {
      console.error('[HealthHub] Error saving medication:', error);
      toast({
        title: 'Error',
        description: `Failed to ${selectedMedication ? 'update' : 'add'} medication`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this animal?')) return;

    try {
      await deleteAnimal(id, user.id);
      setAnimals(animals.filter((a) => a.id !== id));
      if (selectedAnimal?.id === id) {
        setSelectedAnimal(null);
      }
      toast({
        title: 'Success',
        description: 'Animal deleted successfully',
      });
    } catch (error) {
      console.error('[HealthHub] Error deleting animal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete animal',
        variant: 'destructive',
      });
    }
  };

  const handleMedicationDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    try {
      await deleteMedication(id);
      setMedications(medications.filter((m) => m.id !== id));
      if (selectedMedication?.id === id) {
        setSelectedMedication(null);
      }
      toast({
        title: 'Success',
        description: 'Medication deleted successfully',
      });
    } catch (error) {
      console.error('[HealthHub] Error deleting medication:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete medication',
        variant: 'destructive',
      });
    }
  };

  const filteredMedications = medications.filter((med) =>
    med.name.toLowerCase().includes(medicationSearch.toLowerCase()) ||
    med.target_animals.some(animal => animal.toLowerCase().includes(medicationSearch.toLowerCase()))
  );

  // Get filtered medications for dosage calculator based on selected animal type
  const selectedAnimalData = animals.find(a => a.id === dosageAnimal);
  const dosageMedicationsFiltered = selectedAnimalData
    ? medications.filter(med => 
        med.target_animals.some(target => 
          target.toLowerCase() === selectedAnimalData.type.toLowerCase()
        )
      )
    : medications;

  const selectedDosageMedication = medications.find(m => m.id === dosageMedication);
  
  // Calculate dosage when all inputs are ready
  useEffect(() => {
    if (dosageWeight && selectedDosageMedication?.dosage_per_lb) {
      const weight = parseFloat(dosageWeight);
      if (!isNaN(weight) && weight > 0) {
        const dose = calculateDosage(weight, selectedDosageMedication.dosage_per_lb);
        setCalculatedDose(dose);
      } else {
        setCalculatedDose(null);
      }
    } else {
      setCalculatedDose(null);
    }
  }, [dosageWeight, selectedDosageMedication]);

  // Auto-fill weight from animal record
  useEffect(() => {
    if (selectedAnimalData?.weight_lbs) {
      setDosageWeight(selectedAnimalData.weight_lbs.toString());
    } else {
      setDosageWeight('');
    }
  }, [dosageAnimal, selectedAnimalData]);

  const handleResetDosageCalculator = () => {
    setDosageAnimal('');
    setDosageMedication('');
    setDosageWeight('');
    setCalculatedDose(null);
  };

  const handleGroomingScheduleSubmit = async (data: GroomingScheduleInsert) => {
    if (!user?.id) return;

    try {
      if (selectedSchedule) {
        const updated = await updateGroomingSchedule(selectedSchedule.id, user.id, data);
        setGroomingSchedules(groomingSchedules.map((s) => (s.id === updated.id ? updated : s)));
        toast({
          title: 'Success',
          description: 'Grooming schedule updated successfully',
        });
      } else {
        const newSchedule = await createGroomingSchedule(user.id, data);
        setGroomingSchedules([newSchedule, ...groomingSchedules]);
        toast({
          title: 'Success',
          description: 'Grooming schedule added successfully',
        });
      }
      setSelectedSchedule(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedSchedule ? 'update' : 'add'} grooming schedule`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!user?.id) return;
    if (!confirm('Are you sure you want to delete this grooming schedule?')) return;

    try {
      await deleteGroomingSchedule(id, user.id);
      setGroomingSchedules(groomingSchedules.filter((s) => s.id !== id));
      toast({
        title: 'Success',
        description: 'Grooming schedule deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete grooming schedule',
        variant: 'destructive',
      });
    }
  };

  // Calculate upcoming grooming tasks
  const upcomingGroomingTasks = groomingSchedules
    .filter((schedule) => schedule.is_active)
    .map((schedule) => {
      const animal = animals.find((a) => a.id === schedule.animal_id);
      if (!animal) return null;

      const lastCompleted = schedule.last_completed_date
        ? parseISO(schedule.last_completed_date)
        : new Date();
      const nextDue = addDays(lastCompleted, schedule.frequency_days);
      const daysUntilDue = differenceInDays(nextDue, new Date());

      return {
        ...schedule,
        animal,
        nextDue,
        daysUntilDue,
      };
    })
    .filter((task) => task !== null)
    .sort((a, b) => a!.daysUntilDue - b!.daysUntilDue);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'animals', label: 'Animals' },
    { id: 'family-tree', label: 'Family Tree' },
    { id: 'grooming', label: 'Grooming' },
    { id: 'medications', label: 'Medications' },
    { id: 'dosage', label: 'Dosage' },
    { id: 'library', label: 'Library' },
    { id: 'care', label: 'Care' },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'hsl(var(--health-hub-bg))' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Health Hub</h1>
              <p className="text-muted-foreground mt-1">Manage your animals' health and medications</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Types
              </Button>
            </div>
          </div>

          {/* Tab Header */}
          <TabHeader tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          <TabsContent value="animals">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Animal Registry</CardTitle>
                  <Button
                    onClick={() => {
                      setSelectedAnimal(null);
                      setFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Animal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {animals.length === 0 ? (
                  <EmptyState
                    icon={Bird}
                    title="No animals yet"
                    description="Start building your animal registry by adding your first animal."
                    action={
                      <Button onClick={() => setFormOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Animal
                      </Button>
                    }
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Breed</TableHead>
                        <TableHead>Birth Date</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {animals
                        .filter((animal) => 
                          selectedProperty === 'all' || animal.property_id === selectedProperty
                        )
                        .map((animal) => (
                          <TableRow key={animal.id}>
                            <TableCell className="font-medium">{animal.name}</TableCell>
                            <TableCell>{animal.type}</TableCell>
                            <TableCell>{animal.breed || '—'}</TableCell>
                            <TableCell>
                              {animal.birth_date 
                                ? format(new Date(animal.birth_date), 'MMM d, yyyy')
                                : '—'
                              }
                            </TableCell>
                            <TableCell>
                              {properties.find((p) => p.id === animal.property_id)?.name || '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedAnimal(animal);
                                    setFormOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(animal.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <AnimalForm
              open={formOpen}
              onOpenChange={(open) => {
                setFormOpen(open);
                if (!open) setSelectedAnimal(null);
              }}
              animal={selectedAnimal || undefined}
              properties={properties}
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="family-tree">
            <Card>
              <CardHeader>
                <CardTitle>Family Tree</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Family tree visualization coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grooming">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Grooming</CardTitle>
                  <Button
                    onClick={() => {
                      setSelectedSchedule(null);
                      setGroomingFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Grooming Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Inner Tabs */}
                <div className="mb-6">
                  <TabHeader
                    tabs={[
                      { id: 'upcoming', label: 'Upcoming' },
                      { id: 'schedules', label: 'Schedules' },
                      { id: 'history', label: 'History' },
                    ]}
                    activeTab={groomingTab}
                    onTabChange={setGroomingTab}
                  />
                </div>

                <Tabs value={groomingTab} onValueChange={setGroomingTab}>
                  {/* Upcoming Tab */}
                  <TabsContent value="upcoming">
                    {upcomingGroomingTasks.length === 0 ? (
                      <EmptyState
                        icon={Scissors}
                        title="No upcoming grooming tasks"
                        description="Create a grooming schedule to see upcoming tasks here."
                        action={
                          <Button onClick={() => setGroomingFormOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Grooming Schedule
                          </Button>
                        }
                      />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Animal</TableHead>
                            <TableHead>Grooming Type</TableHead>
                            <TableHead>Next Due</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingGroomingTasks.map((task) => {
                            if (!task) return null;
                            const isOverdue = task.daysUntilDue < 0;
                            const isDueSoon = task.daysUntilDue >= 0 && task.daysUntilDue <= 7;

                            return (
                              <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.animal.name}</TableCell>
                                <TableCell>{task.grooming_type}</TableCell>
                                <TableCell>{format(task.nextDue, 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={isOverdue ? 'destructive' : isDueSoon ? 'default' : 'secondary'}
                                  >
                                    {isOverdue
                                      ? `Overdue by ${Math.abs(task.daysUntilDue)} days`
                                      : isDueSoon
                                      ? `Due in ${task.daysUntilDue} days`
                                      : `Due in ${task.daysUntilDue} days`}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* Schedules Tab */}
                  <TabsContent value="schedules">
                    {groomingSchedules.length === 0 ? (
                      <EmptyState
                        icon={Calendar}
                        title="No grooming schedules"
                        description="Add a grooming schedule to track recurring grooming tasks."
                        action={
                          <Button onClick={() => setGroomingFormOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Grooming Schedule
                          </Button>
                        }
                      />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Animal</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Last Completed</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groomingSchedules.map((schedule) => {
                            const animal = animals.find((a) => a.id === schedule.animal_id);
                            return (
                              <TableRow key={schedule.id}>
                                <TableCell className="font-medium">
                                  {animal?.name || 'Unknown'}
                                </TableCell>
                                <TableCell>{schedule.grooming_type}</TableCell>
                                <TableCell>Every {schedule.frequency_days} days</TableCell>
                                <TableCell>
                                  {schedule.last_completed_date
                                    ? format(parseISO(schedule.last_completed_date), 'MMM d, yyyy')
                                    : '—'}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                                    {schedule.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedSchedule(schedule);
                                        setGroomingFormOpen(true);
                                      }}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteSchedule(schedule.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* History Tab */}
                  <TabsContent value="history">
                    {groomingRecords.length === 0 ? (
                      <EmptyState
                        icon={History}
                        title="No grooming history"
                        description="Grooming records will appear here once you complete tasks."
                      />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Animal</TableHead>
                            <TableHead>Grooming Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groomingRecords.map((record) => {
                            const animal = animals.find((a) => a.id === record.animal_id);
                            return (
                              <TableRow key={record.id}>
                                <TableCell className="font-medium">
                                  {animal?.name || 'Unknown'}
                                </TableCell>
                                <TableCell>{record.grooming_type}</TableCell>
                                <TableCell>{format(parseISO(record.date), 'MMM d, yyyy')}</TableCell>
                                <TableCell>{record.notes || '—'}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <GroomingScheduleForm
              open={groomingFormOpen}
              onOpenChange={(open) => {
                setGroomingFormOpen(open);
                if (!open) setSelectedSchedule(null);
              }}
              schedule={selectedSchedule || undefined}
              animals={animals}
              onSubmit={handleGroomingScheduleSubmit}
            />
          </TabsContent>

          <TabsContent value="medications">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Medication Guide */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Medication Guide</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedMedication(null);
                        setMedicationFormOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search medications..."
                      value={medicationSearch}
                      onChange={(e) => setMedicationSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Medication List */}
                  <div className="space-y-2">
                    {filteredMedications.length === 0 ? (
                      <EmptyState
                        icon={Pill}
                        title="No medications"
                        description="Add your first medication to get started."
                        className="py-8"
                      />
                    ) : (
                      filteredMedications.map((medication) => (
                        <div
                          key={medication.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                            selectedMedication?.id === medication.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => setSelectedMedication(medication)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{medication.name}</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {medication.target_animals.slice(0, 3).map((animal, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {animal}
                                  </Badge>
                                ))}
                                {medication.target_animals.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{medication.target_animals.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMedication(medication);
                                  setMedicationFormOpen(true);
                                }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMedicationDelete(medication.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right: Medication Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Medication Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMedication ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{selectedMedication.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedMedication.target_animals.map((animal, idx) => (
                            <Badge key={idx} variant="secondary">
                              {animal}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Dosage</h4>
                          <p className="text-lg">
                            {selectedMedication.dosage_per_lb 
                              ? `${selectedMedication.dosage_per_lb} ${selectedMedication.dosage_unit || ''} per lb`
                              : 'Not specified'
                            }
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Administration Method</h4>
                          <p className="text-lg">{selectedMedication.administration_method || 'Not specified'}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Meat Withdrawal Period</h4>
                          <p className="text-lg">
                            {selectedMedication.withdrawal_period_meat_days !== null
                              ? `${selectedMedication.withdrawal_period_meat_days} days`
                              : 'Not specified'
                            }
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Milk Withdrawal Period</h4>
                          <p className="text-lg">
                            {selectedMedication.withdrawal_period_milk_days !== null
                              ? `${selectedMedication.withdrawal_period_milk_days} days`
                              : 'Not specified'
                            }
                          </p>
                        </div>
                      </div>

                      {selectedMedication.notes && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Notes</h4>
                          <p className="text-sm whitespace-pre-wrap">{selectedMedication.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Select a medication to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <MedicationForm
              open={medicationFormOpen}
              onOpenChange={(open) => {
                setMedicationFormOpen(open);
                if (!open) setSelectedMedication(null);
              }}
              medication={selectedMedication || undefined}
              onSubmit={handleMedicationSubmit}
            />
          </TabsContent>

          <TabsContent value="dosage">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Dosage Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Select Animal */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Step 1: Select Animal</label>
                  <Select value={dosageAnimal} onValueChange={setDosageAnimal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {animals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name} ({animal.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 2: Select Medication */}
                {dosageAnimal && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Step 2: Select Medication</label>
                    <Select value={dosageMedication} onValueChange={setDosageMedication}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a medication" />
                      </SelectTrigger>
                      <SelectContent>
                        {dosageMedicationsFiltered.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No medications available for this animal type
                          </div>
                        ) : (
                          dosageMedicationsFiltered.map((med) => (
                            <SelectItem key={med.id} value={med.id}>
                              {med.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedAnimalData && dosageMedicationsFiltered.length < medications.length && (
                      <p className="text-xs text-muted-foreground">
                        Filtered for {selectedAnimalData.type}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 3: Enter Weight */}
                {dosageMedication && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      Step 3: Animal Weight (lbs)
                      {selectedAnimalData?.weight_lbs && (
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                          (Auto-filled from animal record)
                        </span>
                      )}
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter weight in pounds"
                      value={dosageWeight}
                      onChange={(e) => setDosageWeight(e.target.value)}
                    />
                  </div>
                )}

                {/* Calculation Result */}
                {calculatedDose !== null && selectedDosageMedication && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Calculated Dosage</p>
                      <p className="text-4xl font-bold text-primary mb-1">
                        {formatDosage(calculatedDose, selectedDosageMedication.dosage_unit)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDosageMedication.name} for {selectedAnimalData?.name}
                      </p>
                      {selectedDosageMedication.administration_method && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Method: {selectedDosageMedication.administration_method}
                        </p>
                      )}
                    </div>

                    {/* Withdrawal Periods */}
                    {(selectedDosageMedication.withdrawal_period_meat_days !== null || 
                      selectedDosageMedication.withdrawal_period_milk_days !== null) && (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedDosageMedication.withdrawal_period_meat_days !== null && (
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Meat Withdrawal</p>
                            <p className="text-lg font-semibold">
                              {selectedDosageMedication.withdrawal_period_meat_days} days
                            </p>
                          </div>
                        )}
                        {selectedDosageMedication.withdrawal_period_milk_days !== null && (
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Milk Withdrawal</p>
                            <p className="text-lg font-semibold">
                              {selectedDosageMedication.withdrawal_period_milk_days} days
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Disclaimer */}
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Disclaimer:</strong> This calculator is for reference only. Always consult with a licensed veterinarian before administering any medication. Dosages may vary based on individual animal health, age, and condition. Follow all label instructions and observe proper withdrawal periods.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleResetDosageCalculator}
                    >
                      Calculate Another Dosage
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!dosageAnimal && animals.length === 0 && (
                  <EmptyState
                    icon={Calculator}
                    title="No animals yet"
                    description="Add animals to start calculating dosages."
                    className="py-8"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library">
            <Card>
              <CardHeader>
                <CardTitle>Health Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Health resources coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care">
            <Card>
              <CardHeader>
                <CardTitle>Care Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Care schedule coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
