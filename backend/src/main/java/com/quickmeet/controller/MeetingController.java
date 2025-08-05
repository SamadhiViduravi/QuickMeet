package com.quickmeet.controller;

import com.quickmeet.model.Meeting;
import com.quickmeet.model.User;
import com.quickmeet.repository.MeetingRepository;
import com.quickmeet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private MeetingRepository meetingRepository;
    private UserRepository userRepository;

    @Autowired
    public MeetingController(MeetingRepository meetingRepository, UserRepository userRepository) {
        this.meetingRepository = meetingRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createMeeting(@RequestBody Meeting meeting) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = authentication.getName(); // This will be the email from CustomUserDetailsService

        Optional<User> organizerOptional = userRepository.findByEmail(currentUserName);
        if (organizerOptional.isEmpty()) {
            return new ResponseEntity<>("Organizer not found.", HttpStatus.UNAUTHORIZED);
        }
        User organizer = organizerOptional.get();
        meeting.setOrganizerId(organizer.getId());

        // Check for time conflicts for the organizer
        List<Meeting> organizerMeetings = meetingRepository.findByOrganizerId(organizer.getId());
        for (Meeting existingMeeting : organizerMeetings) {
            if (meetingsOverlap(meeting, existingMeeting)) {
                return new ResponseEntity<>("Meeting conflicts with an existing meeting for the organizer.", HttpStatus.CONFLICT);
            }
        }

        // Simulate checking conflicts for participants (in a real app, you'd check their calendars)
        for (String participantEmail : meeting.getParticipants()) {
            Optional<User> participantOptional = userRepository.findByEmail(participantEmail);
            if (participantOptional.isPresent()) {
                // For simplicity, we're not checking participant's actual schedules here.
                // In a real app, you'd fetch participant's meetings and check for overlaps.
                // This is a placeholder for demonstrating the concept.
            } else {
                // Optionally, handle cases where a participant email doesn't exist in your user base
                System.out.println("Warning: Participant email not found: " + participantEmail);
            }
        }

        Meeting savedMeeting = meetingRepository.save(meeting);
        return new ResponseEntity<>(savedMeeting, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Meeting>> getAllMeetings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = authentication.getName(); // This will be the email

        Optional<User> currentUserOptional = userRepository.findByEmail(currentUserName);
        if (currentUserOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        User currentUser = currentUserOptional.get();

        // Fetch meetings where the current user is the organizer OR a participant
        List<Meeting> meetings = meetingRepository.findByOrganizerIdOrParticipantsContaining(currentUser.getId(), currentUser.getEmail());
        return new ResponseEntity<>(meetings, HttpStatus.OK);
    }

    // Helper method to check for time overlaps
    private boolean meetingsOverlap(Meeting newMeeting, Meeting existingMeeting) {
        LocalDateTime newStart = newMeeting.getStartTime();
        LocalDateTime newEnd = newMeeting.getEndTime();
        LocalDateTime existingStart = existingMeeting.getStartTime();
        LocalDateTime existingEnd = existingMeeting.getEndTime();

        return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
    }
}
