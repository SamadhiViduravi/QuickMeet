package com.quickmeet.repository;

import com.quickmeet.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByOrganizerId(Long organizerId);

    @Query("SELECT m FROM Meeting m WHERE m.organizerId = :userId OR :userEmail MEMBER OF m.participants")
    List<Meeting> findByOrganizerIdOrParticipantsContaining(@Param("userId") Long userId, @Param("userEmail") String userEmail);
}
