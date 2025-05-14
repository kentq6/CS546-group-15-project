import 'dotenv/config';
import mongoose from 'mongoose';
import { connectToDb } from '../config/connection.js';
import { User, Company, Project, Task, Blueprint, Report } from '../model/model.js';
import bcrypt from 'bcrypt';


async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Clear existing collections
    await mongoose.connection.dropDatabase();
    console.log('Dropped existing database');

    // ========== COMPANY 1: Small Company ==========
    const smallCompanyId = new mongoose.Types.ObjectId();
    
    // Create Owner
    const smallCompanyOwner = await User.create({
      username: 'smallowner',
      password: 'Password1!',
      firstname: 'John',
      lastname: 'Smith',
      company: smallCompanyId,
      role: 'Owner'
    });
    
    // Create Field Manager
    const smallCompanyManager = await User.create({
      username: 'smallmanager',
      password: 'Password1!',
      firstname: 'Emily',
      lastname: 'Johnson',
      company: smallCompanyId,
      role: 'Field Manager'
    });
    
    // Create the Small Company
    const smallCompany = await Company.create({
      _id: smallCompanyId,
      title: 'Small Construction Co',
      owner: smallCompanyOwner._id,
      location: 'Boston, Massachusetts',
      industry: 'Residential Construction'
    });
    
    console.log('Created Small Company with 1 Owner and 1 Field Manager');

    // ========== COMPANY 2: Large Company ==========
    const largeCompanyId = new mongoose.Types.ObjectId();
    
    // Create Owner
    const largeCompanyOwner = await User.create({
      username: 'largeowner',
      password: 'Password1!',
      firstname: 'Michael',
      lastname: 'Williams',
      company: largeCompanyId,
      role: 'Owner'
    });
    
    // Create Field Managers
    const fieldManager1 = await User.create({
      username: 'fieldmgr1',
      password: 'Password1!',
      firstname: 'Sarah',
      lastname: 'Davis',
      company: largeCompanyId,
      role: 'Field Manager'
    });
    
    const fieldManager2 = await User.create({
      username: 'fieldmgr2',
      password: 'Password1!',
      firstname: 'Robert',
      lastname: 'Miller',
      company: largeCompanyId,
      role: 'Field Manager'
    });
    
    const fieldManager3 = await User.create({
      username: 'fieldmgr3',
      password: 'Password1!',
      firstname: 'Jessica',
      lastname: 'Wilson',
      company: largeCompanyId,
      role: 'Field Manager'
    });
    
    // Create Engineers
    const engineers = [];
    const engineerLastNames = [
      'Anderson',
      'Baker',
      'Chen',
      'Davis',
      'Edwards',
      'Flores',
      'Garcia',
      'Hoffman',
      'Ivanov',
      'Jackson'
    ];
    
    for (let i = 0; i < 10; i++) {
      const engineer = await User.create({
        username: `engineer${i+1}`,
        password: 'Password1!',
        firstname: 'Engineer',
        lastname: engineerLastNames[i],
        company: largeCompanyId,
        role: 'Engineer'
      });
      engineers.push(engineer);
    }
    
    // Create the Large Company
    const largeCompany = await Company.create({
      _id: largeCompanyId,
      title: 'Large Construction Corp',
      owner: largeCompanyOwner._id,
      location: 'Chicago, Illinois',
      industry: 'Commercial Construction'
    });
    
    console.log('Created Large Company with 1 Owner, 3 Field Managers, and 10 Engineers');
    
    // ========== PROJECTS FOR LARGE COMPANY ==========
    
    // Project 1: Office Building
    const project1 = await Project.create({
      title: 'Downtown Office Tower',
      description: 'Construction of a 30-story office building in downtown Chicago',
      status: 'InProgress',
      company: largeCompanyId,
      members: [
        fieldManager1._id,
        engineers[0]._id,
        engineers[1]._id,
        engineers[2]._id
      ],
      budget: 25000000
    });
    
    // Project 2: Shopping Mall
    const project2 = await Project.create({
      title: 'Westside Shopping Mall',
      description: 'Development of a two-level shopping mall with 50+ retail spaces',
      status: 'Pending',
      company: largeCompanyId,
      members: [
        fieldManager2._id,
        engineers[3]._id,
        engineers[4]._id,
        engineers[5]._id
      ],
      budget: 18000000
    });
    
    // Project 3: Hospital Expansion
    const project3 = await Project.create({
      title: 'Memorial Hospital Expansion',
      description: 'Adding a new wing to the existing Memorial Hospital',
      status: 'InProgress',
      company: largeCompanyId,
      members: [
        fieldManager3._id,
        engineers[6]._id,
        engineers[7]._id
      ],
      budget: 12000000
    });
    
    // Project 4: Residential Complex
    const project4 = await Project.create({
      title: 'Lakeside Residences',
      description: 'A luxury residential complex with 200 apartments',
      status: 'Pending',
      company: largeCompanyId,
      members: [
        fieldManager1._id,
        engineers[8]._id,
        engineers[9]._id
      ],
      budget: 22000000
    });
    
    console.log('Created 4 projects for Large Company');
    
    // ========== TASKS FOR PROJECT 1 (DOWNTOWN OFFICE TOWER) ==========
    // Extended with detailed subcomponents
    const project1Tasks = [
      await Task.create({
        title: 'Site Excavation',
        description: 'Initial excavation of the construction site to required depth',
        project: project1._id,
        status: 'Complete',
        cost: 850000,
        assignedTo: engineers[0]._id
      }),
      
      await Task.create({
        title: 'Foundation Work',
        description: 'Pouring and curing the concrete foundation for the main structure',
        project: project1._id,
        status: 'InProgress',
        cost: 1250000,
        assignedTo: engineers[0]._id
      }),
      
      await Task.create({
        title: 'Basement Levels Construction',
        description: 'Construction of 3 basement levels including parking areas',
        project: project1._id,
        status: 'Pending',
        cost: 3200000,
        assignedTo: engineers[0]._id
      }),
      
      await Task.create({
        title: 'Structural Steel Framework',
        description: 'Installation of primary structural steel components for the tower',
        project: project1._id,
        status: 'Pending',
        cost: 4500000,
        assignedTo: engineers[1]._id
      }),
      
      await Task.create({
        title: 'Secondary Steel Structures',
        description: 'Installation of secondary steel components and floor supports',
        project: project1._id,
        status: 'Pending',
        cost: 2800000,
        assignedTo: engineers[1]._id
      }),
      
      await Task.create({
        title: 'Exterior Facade Design',
        description: 'Design and preparation work for the glass facade',
        project: project1._id,
        status: 'InProgress',
        cost: 750000,
        assignedTo: engineers[1]._id
      }),
      
      await Task.create({
        title: 'Main Electrical Systems',
        description: 'Installation of primary electrical conduits and systems',
        project: project1._id,
        status: 'Pending',
        cost: 1800000,
        assignedTo: engineers[2]._id
      }),
      
      await Task.create({
        title: 'Plumbing Base Installation',
        description: 'Installation of main plumbing lines and sewage systems',
        project: project1._id,
        status: 'Pending',
        cost: 1200000,
        assignedTo: engineers[2]._id
      }),
      
      await Task.create({
        title: 'HVAC System Planning',
        description: 'Detailed planning and preparation for HVAC installation',
        project: project1._id,
        status: 'InProgress',
        cost: 980000,
        assignedTo: engineers[2]._id
      }),
      
      await Task.create({
        title: 'Elevator Shaft Construction',
        description: 'Construction of elevator shafts and preparation for elevator installation',
        project: project1._id,
        status: 'Pending',
        cost: 1450000,
        assignedTo: engineers[3]._id
      }),
      
      await Task.create({
        title: 'Fire Safety Systems',
        description: 'Installation of fire suppression and safety systems throughout the building',
        project: project1._id,
        status: 'Pending',
        cost: 1350000,
        assignedTo: engineers[4]._id
      }),
      
      await Task.create({
        title: 'Security Infrastructure',
        description: 'Preparation for security systems including access control and surveillance',
        project: project1._id,
        status: 'Pending',
        cost: 920000,
        assignedTo: engineers[5]._id
      })
    ];
    
    // ========== TASKS FOR PROJECT 2 ==========
    const project2Tasks = [
      await Task.create({
        title: 'Land Clearing',
        description: 'Clearing the site and preparing for construction',
        project: project2._id,
        status: 'InProgress',
        cost: 500000,
        assignedTo: engineers[3]._id
      }),
      
      await Task.create({
        title: 'Foundation Planning',
        description: 'Planning and marking foundation areas',
        project: project2._id,
        status: 'Pending',
        cost: 120000,
        assignedTo: engineers[4]._id
      })
    ];
    
    // ========== TASKS FOR PROJECT 3 ==========
    const project3Tasks = [
      await Task.create({
        title: 'Demolition Work',
        description: 'Demolishing the connecting wall to prepare for expansion',
        project: project3._id,
        status: 'Complete',
        cost: 350000,
        assignedTo: engineers[6]._id
      }),
      
      await Task.create({
        title: 'Foundation Pouring',
        description: 'Pouring concrete for the foundation of the new wing',
        project: project3._id,
        status: 'InProgress',
        cost: 780000,
        assignedTo: engineers[7]._id
      })
    ];
    
    console.log('Created tasks for projects');
    
    // ========== BLUEPRINTS FOR PROJECT 1 (DOWNTOWN OFFICE TOWER) ==========
    // Expanded with more detailed blueprints
    const project1Blueprints = [
      await Blueprint.create({
        title: 'Main Tower Structure Blueprint',
        project: project1._id,
        tags: ['structure', 'main', 'tower'],
        uploadedBy: fieldManager1._id
      }),
      
      await Blueprint.create({
        title: 'Foundation Details',
        project: project1._id,
        tags: ['foundation', 'structural', 'concrete'],
        uploadedBy: engineers[0]._id
      }),
      
      await Blueprint.create({
        title: 'Basement Parking Layout',
        project: project1._id,
        tags: ['basement', 'parking', 'layout'],
        uploadedBy: fieldManager1._id
      }),
      
      await Blueprint.create({
        title: 'Electrical Layout Floors1to10',
        project: project1._id,
        tags: ['electrical', 'wiring', 'lowfloors'],
        uploadedBy: engineers[2]._id
      }),
      
      await Blueprint.create({
        title: 'Electrical Layout Mid Floors',
        project: project1._id,
        tags: ['electrical', 'wiring', 'midfloors'],
        uploadedBy: engineers[2]._id
      }),
      
      await Blueprint.create({
        title: 'Electrical Layout Top Floors',
        project: project1._id,
        tags: ['electrical', 'wiring', 'highfloors'],
        uploadedBy: engineers[2]._id
      }),
      
      await Blueprint.create({
        title: 'Plumbing System Schematic',
        project: project1._id,
        tags: ['plumbing', 'water', 'sewage'],
        uploadedBy: engineers[2]._id
      }),
      
      await Blueprint.create({
        title: 'HVAC Duct Layout',
        project: project1._id,
        tags: ['hvac', 'ventilation', 'aircon'],
        uploadedBy: engineers[2]._id
      }),
      
      await Blueprint.create({
        title: 'Elevator System Design',
        project: project1._id,
        tags: ['elevator', 'transportation'],
        uploadedBy: engineers[3]._id
      }),
      
      await Blueprint.create({
        title: 'Facade Glass Panel Design',
        project: project1._id,
        tags: ['facade', 'exterior', 'glass'],
        uploadedBy: engineers[1]._id
      }),
      
      await Blueprint.create({
        title: 'Fire Safety System Layout',
        project: project1._id,
        tags: ['safety', 'fire', 'sprinklers'],
        uploadedBy: engineers[4]._id
      }),
      
      await Blueprint.create({
        title: 'Security System Placement',
        project: project1._id,
        tags: ['security', 'surveillance', 'access'],
        uploadedBy: engineers[5]._id
      })
    ];
    
    // ========== BLUEPRINTS FOR OTHER PROJECTS ==========
    const otherBlueprints = [
      await Blueprint.create({
        title: 'Mall Floor Plan',
        project: project2._id,
        tags: ['floorplan', 'retail'],
        uploadedBy: fieldManager2._id
      }),
      
      await Blueprint.create({
        title: 'Hospital Wing Structure',
        project: project3._id,
        tags: ['structure', 'medical'],
        uploadedBy: fieldManager3._id
      })
    ];
    
    const allBlueprints = [...project1Blueprints, ...otherBlueprints];
    
    console.log('Created blueprints for projects');
    
    // ========== REPORTS FOR PROJECT 1 (DOWNTOWN OFFICE TOWER) ==========
    // Enhanced with detailed reports for Project 1
    const project1Reports = [
      await Report.create({
        title: 'Site Excavation Report',
        description: 'Final report on the completion of site excavation work for the office tower',
        project: project1._id,
        tags: ['excavation', 'completion', 'siteprep'],
        fileURL: 'excavation-completion.pdf'
      }),
      
      await Report.create({
        title: 'Foundation Report Week1',
        description: 'Weekly report on the foundation progress for the office tower',
        project: project1._id,
        tags: ['foundation', 'progress', 'weekly'],
        fileURL: 'foundation-report-week1.pdf'
      }),
      
      await Report.create({
        title: 'Foundation Report Week2',
        description: 'Weekly report on the foundation progress for the office tower',
        project: project1._id,
        tags: ['foundation', 'progress', 'weekly'],
        fileURL: 'foundation-report-week2.pdf'
      }),
      
      await Report.create({
        title: 'Foundation Report Week3',
        description: 'Weekly report on the foundation progress for the office tower',
        project: project1._id,
        tags: ['foundation', 'progress', 'weekly'],
        fileURL: 'foundation-report-week3.pdf'
      }),
      
      await Report.create({
        title: 'Steel Prep Assessment',
        description: 'Assessment of the site readiness for structural steel installation',
        project: project1._id,
        tags: ['steel', 'preparation', 'assessment'],
        fileURL: 'steel-prep-assessment.pdf'
      }),
      
      await Report.create({
        title: 'Electrical Systems Plan',
        description: 'Comprehensive planning document for electrical systems installation',
        project: project1._id,
        tags: ['electrical', 'planning', 'systems'],
        fileURL: 'electrical-planning.pdf'
      }),
      
      await Report.create({
        title: 'HVAC Systems Plan',
        description: 'Detailed planning document for HVAC system installation and requirements',
        project: project1._id,
        tags: ['hvac', 'planning', 'ventilation'],
        fileURL: 'hvac-planning.pdf'
      }),
      
      await Report.create({
        title: 'Facade Design Approval',
        description: 'Final approval documentation for the building facade design',
        project: project1._id,
        tags: ['facade', 'design', 'approval'],
        fileURL: 'facade-design-approval.pdf'
      }),
      
      await Report.create({
        title: 'Safety Inspection Report',
        description: 'First safety compliance inspection report for the construction site',
        project: project1._id,
        tags: ['safety', 'compliance', 'inspection'],
        fileURL: 'safety-inspection-1.pdf'
      }),
      
      await Report.create({
        title: 'Environmental Assessment',
        description: 'Assessment of the environmental impact of the construction process',
        project: project1._id,
        tags: ['environmental', 'impact', 'assessment'],
        fileURL: 'environmental-impact.pdf'
      })
    ];
    
    // Add issues to the reports for Project 1
    // Report 1: Site Excavation Completion
    project1Reports[0].issues.push({
      title: 'Unexpected Rock Formation',
      description: 'Discovered large rock formation that required additional equipment for removal',
      status: 'Complete',
      raisedBy: engineers[0]._id
    });
    
    project1Reports[0].issues.push({
      title: 'Minor Discrepancy',
      description: 'Slight discrepancy found between property survey and actual markers',
      status: 'Complete',
      raisedBy: fieldManager1._id
    });
    
    await project1Reports[0].save();
    
    // Report 2: Foundation Progress - Week 1
    project1Reports[1].issues.push({
      title: 'Concrete Quality Issue',
      description: 'The delivered concrete did not meet the required specifications',
      status: 'InProgress',
      raisedBy: engineers[0]._id
    });
    
    project1Reports[1].issues.push({
      title: 'Schedule Delay',
      description: 'Weather conditions caused a 3-day delay in the pouring schedule',
      status: 'Complete',
      raisedBy: fieldManager1._id
    });
    
    await project1Reports[1].save();
    
    // Report 3: Foundation Progress - Week 2
    project1Reports[2].issues.push({
      title: 'Equipment Malfunction',
      description: 'Main concrete pump malfunctioned requiring emergency repair',
      status: 'Complete',
      raisedBy: engineers[0]._id
    });
    
    project1Reports[2].issues.push({
      title: 'Labor Shortage',
      description: 'Insufficient skilled workers available for the concrete finishing',
      status: 'Complete',
      raisedBy: fieldManager1._id
    });
    
    await project1Reports[2].save();
    
    // Report 4: Foundation Progress - Week 3
    project1Reports[3].issues.push({
      title: 'Material Delivery Delay',
      description: 'Rebar delivery delayed by 2 days affecting the schedule',
      status: 'Complete',
      raisedBy: engineers[0]._id
    });
    
    project1Reports[3].issues.push({
      title: 'Quality Control Concern',
      description: 'Some sections of the poured foundation showing minor honeycombing',
      status: 'InProgress',
      raisedBy: fieldManager1._id
    });
    
    await project1Reports[3].save();
    
    // Report 5: Structural Steel Preparatory Assessment
    project1Reports[4].issues.push({
      title: 'Anchor bolt',
      description: 'Some anchor bolts deviate from the specified positions by up to 1/2 inch',
      status: 'InProgress',
      raisedBy: engineers[1]._id
    });
    
    await project1Reports[4].save();
    
    // Report 6: Electrical Systems Planning
    project1Reports[5].issues.push({
      title: 'Load Calculation Discrepancy',
      description: 'Main electrical load calculations need revision based on updated equipment specs',
      status: 'Pending',
      raisedBy: engineers[2]._id
    });
    
    project1Reports[5].issues.push({
      title: 'Conduit Path Conflict',
      description: 'Planned electrical conduit paths conflict with structural elements in several locations',
      status: 'InProgress',
      raisedBy: engineers[2]._id
    });
    
    await project1Reports[5].save();
    
    // Report 9: Safety Compliance Inspection
    project1Reports[8].issues.push({
      title: 'Fall Protection',
      description: 'Several areas found without adequate fall protection measures',
      status: 'InProgress',
      raisedBy: fieldManager1._id
    });
    
    project1Reports[8].issues.push({
      title: 'Emergency Exit Missing',
      description: 'Temporary structures lack required emergency exit signage',
      status: 'Complete',
      raisedBy: engineers[4]._id
    });
    
    project1Reports[8].issues.push({
      title: 'First Aid Supplies Inadequate',
      description: 'First aid stations not fully stocked according to regulations',
      status: 'Complete',
      raisedBy: fieldManager1._id
    });
    
    await project1Reports[8].save();
    
    // Report 10: Environmental Impact
    project1Reports[9].issues.push({
      title: 'Dust Control Measures Insufficient',
      description: 'Current dust suppression methods not effective during high winds',
      status: 'InProgress',
      raisedBy: engineers[0]._id
    });
    
    project1Reports[9].issues.push({
      title: 'Runoff Containment Issue',
      description: 'Rain event showed inadequate containment of site runoff',
      status: 'Pending',
      raisedBy: fieldManager1._id
    });
    
    await project1Reports[9].save();
    
    // ========== REPORTS FOR OTHER PROJECTS ==========
    const report2 = await Report.create({
      title: 'Site Preparation Report',
      description: 'Initial report on the shopping mall site preparation',
      project: project2._id,
      tags: ['siteprep', 'initial'],
      fileURL: 'site-prep-report.pdf'
    });
    
    report2.issues.push({
      title: 'Drainage Issues',
      description: 'Unexpected water drainage patterns discovered on the east side of the property',
      status: 'Pending',
      raisedBy: engineers[3]._id
    });
    
    await report2.save();
    
    const report3 = await Report.create({
      title: 'Demolition Completion Report',
      description: 'Final report on the completion of demolition work',
      project: project3._id,
      tags: ['demolition', 'completion'],
      fileURL: 'demolition-report.pdf'
    });
    
    await report3.save();
    
    console.log('Created detailed reports with issues for projects');
    
    console.log('Database seeding completed successfully');
    console.log('\nLogin Credentials:');
    console.log('Small Company Owner: username: smallowner, password: Password1!');
    console.log('Small Company Field Manager: username: smallmanager, password: Password1!');
    console.log('Large Company Owner: username: largeowner, password: Password1!');
    console.log('Large Company Field Managers: username: fieldmgr1/2/3, password: Password1!');
    console.log('Large Company Engineers: username: engineer1-10, password: Password1!');
    
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Connect to the database and run the seed function
connectToDb()
  .then(() => {
    console.log('Connected to database');
    return seed();
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });