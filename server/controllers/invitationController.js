import crypto from 'crypto';
import { inviteStatusOptions } from "../enums.js";
import prisma from "../db.js";
import { inviteUserSchema, expirationSchema } from "../schemas/invitationSchema.js"

const PENDING = inviteStatusOptions.PENDING;
const ACCEPTED = inviteStatusOptions.ACCEPTED;
const REJECTED = inviteStatusOptions.REJECTED;

export async function showEventInvites(req, res) {
  const eventId = parseInt(req.params.id);

  try {
    const event = await prisma.event.findUnique({  where: { eventId: eventId, deletedAt: null } });

    if (!event) {
      return res.status(404).json({ success: false, error: "No invites to show - event not found" });
    }

    const data = await prisma.invitation.findMany({
      where: { eventId: eventId },
      select: {
        invitationId: true,
        receiverId: true,
        token: true,
        expiresAt: true,
        status: true,
        createdAt: true,
        userCredentials: {
            select: {
                userProfile: {
                    select: {
                        name: true,
                        surname: true,
                        nickname: true
                    }
                }
            }
        },
        event: {
            select: {
                eventName: true
            }
        }
      },
    });

    const invites = data.map((invite) => {
        const info = {
            invitationId: invite.invitationId,
            expiresAt: invite.expiresAt,
            status: invite.status,
            createdAt: invite.createdAt
        };

        if (invite.token) {
            return {
                ...info,
                type: "link",
                token: invite.token
            };
        }

        return {
            ...info,
            type: "personal",
            receiverId: invite.receiverId,
            name: invite.userCredentials?.userProfile?.name || null,
            surname: invite.userCredentials?.userProfile?.surname || null,
            nickname: invite.userCredentials?.userProfile?.nickname || null,
        };
    });

    return res.status(200).json({ 
        success: true, 
        message: `Pomyślnie zebrano i wyświetlono wszystkie zaproszenia wysłane do ${invite.event.eventName}`,
        data: invites });

  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "A database error has occurred" });
  }
}


export async function inviteUser(req, res) {
  const eventId = parseInt(req.params.id);

  // Walidacja
  const validation = inviteUserSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ success: false, details: validation.error.format() });
  
  const { receiverIds, expiresAt } = validation.data;

  try {
    // Trzeba by było dodać warunek z data/statusem jezeli chcemy zapraaszac tylko do aktywnych eventów
    const event = await prisma.event.findUnique({  where: { eventId: eventId, deletedAt: null } });

    if (!event) {
      return res.status(404).json({ success: false, error: "No event not found" });
    }

    const invitations = await Promise.all(
        receiverIds.map(userId => 
            prisma.invitation.create({
                data: {
                    eventId: eventId,
                    receiverId: userId,
                    expiresAt: expiresAt ? new Date(expiresAt) : null
                },
                include: { // Do wyświetlenia potwierdzenia zaproszenia
                    event: {
                        select: {
                            eventName: true
                        }
                    },
                    userCredentials: {
                        include: {
                            userProfile: {
                                select: {
                                    name: true,
                                    surname: true,
                                    nickname: true
                                }
                            }
                        }
                    }
                }
            })
        )
    );

    return res.status(201).json({ 
        success: true, 
        message: `Pomyślnie zaproszono ${invitations.length} użytkowników.`,
        data: invitations.map(invitation => ({
            id: invitation.invitationId,
            eventName: invitation.event.eventName,
            receiverName: invitation.userCredentials?.userProfile?.name || "AnonimName",
            receiverSurname: invitation.userCredentials?.userProfile?.surname || "AnonimSurname",
            receiverNickname: invitation.userCredentials?.userProfile?.nickname || "AnonimNickname",
        }))
     });

  } catch (err) {
    if (err.code === 'P2002') { // Nie wiem do konca czy ten kod jest dobry, ale potrzebny byl error z podwojnym dodawaniem osob i chyba to tak ma prawo zadzialac
        return res.status(400).json({ success: false, error: "Jeden lub więcej użytkowników jest już zaproszonych na to wydarzenie." });
    }
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "A database error has occurred" });
  }
}


export async function inviteViaLink(req, res) {
  const eventId = parseInt(req.params.id);
  
  // Walidacja
  const validation = expirationSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ success: false, details: validation.error.format() });
  
  const { expiresAt } = validation.data;

  try {
    // Trzeba by było dodać warunek z data/statusem jezeli chcemy zapraaszac tylko do aktywnych eventów
    const event = await prisma.event.findUnique({  where: { eventId: eventId, deletedAt: null } });

    if (!event) {
      return res.status(404).json({ success: false, error: "No event not found" });
    }

    const token = crypto.randomBytes(16).toString('hex');

    const invitation = await prisma.invitation.create({
        data: {
            eventId: eventId,
            token: token,
            expiresAt: expiresAt ? new Date(expiresAt) : null
        },
        include: { // Do wyświetlenia potwierdzenia zaproszenia
            event: {
                select: {
                    eventName: true
                }
            }
        }
    });

    const clientURL = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
    const link = `${clientURL}/invite?token=${token}`;

    return res.status(201).json({ 
        success: true, 
        message: "Link został poprawnie wygenerowany",
        data: {
            invitationId: invitation.invitationId,
            eventName: invitation.event.eventName,
            token: token,
            link: link
        }
     });

  } catch (err) {
    console.error("Błąd podczas generowania linku.", err);
    return res
      .status(500)
      .json({ success: false, error: "A database error has occurred" });
  }
}


export async function changeExpirationDate(req, res) {
  const invitationId = parseInt(req.params);
  
  // Walidacja
  const validation = expirationSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ success: false, details: validation.error.format() });
  
  const { expiresAt } = validation.data;

  try {
    const updated = await prisma.invitation.update({
        where: {
            invitationId: invitationId
        },
        data: {
            ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null})
        }
    });

    return res.status(200).json({ 
        success: true, 
        message: "Zaproszenie zostało zaktualizowane.",
        //data: updated // Nie wiem czy potrzebujemy je wysyłać? Chyba nie
     });

  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: "Nie znaleziono zaproszenia." });
    }
    console.error("Nastąpił błąd podczas zapisywania zmian w zaproszeniu.", err);
    return res
      .status(500)
      .json({ success: false, error: "A database error has occurred" });
  }
}


export async function deleteInvite(req, res) {
  const invitationId = parseInt(req.params);

  try {
    await prisma.invitation.delete({
        where: { invitationId: invitationId }
    });

    return res.status(204).json({ 
        success: true, 
        message: "Zaproszenie zostało usunięte.",
     });

  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: "Nie znaleziono zaproszenia." });
    }
    console.error("Nastąpił błąd podczas zapisywania zmian w zaproszeniu.", err);
    return res
      .status(500)
      .json({ success: false, error: "A database error has occurred" });
  }
}


export async function showUserInvites(req, res) {
  const userId = req.params.id;

  try {
    const user = await prisma.userCredentials.findUnique({  
        where: { userId: userId },
        select: {
            userProfile: {
                select: {
                    nickname: true
                }
            },
            invitations: {
                where: {
                    status: PENDING,
                },
                select: {
                    invitationId: true,
                    status: true,
                    expiresAt: true,
                    createdAt: true,
                    event: {
                        select: {
                            eventName: true
                        }
                    }
                }
            }
        }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "No invites to show - user not found" });
    }

    const invites = user.invitations.map((invite) => {
        return {
            invitationId: invite.invitationId,
            eventName: invite.event.eventName,
            expiresAt: invite.expiresAt,
            status: invite.status,
            createdAt: invite.createdAt
        };
        
    });

    const userNick = user.userProfile?.nickname || "użytkownika";

    return res.status(200).json({ 
        success: true, 
        message: `Pomyślnie zebrano i wyświetlono wszystkie zaproszenia wysłane do ${userNick}`,
        data: invites });

  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "A database error has occurred" });
  }
}


export async function showInvite(req, res) {
  const { token } = req.params;

  try {
    const invitation = await prisma.invitation.findUnique({  
        where: { token: token },
        select: {
            invitationId: true,
            status: true,
            createdAt: true,
            expiresAt: true,
            event: {
                select: {
                    eventId: true,
                    eventName: true,
                    description: true,
                    isPublic: true,
                    eventDateTime: true,
                    locationName: true,
                    locationAddress: true,
                    eventStatus: true
                }
            }
        }
    });

    if (!invitation) {
      return res.status(404).json({ success: false, error: "Invitation not found - cant show the invite" });
    }

    if (invitation.expiresAt && new Date() > new Date(invitation.expiresAt)) {
        return res.status(410).json({ success: false, error: "To zaproszenie już wygasło." });
    }

    const data = {
        invitationId: invitation.invitationId,
        status: invitation.status,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        eventId: invitation.event.eventId,
        eventName: invitation.event.eventName,
        description: invitation.event.description,
        isPublic: invitation.event.isPublic,
        eventDateTime: invitation.event.eventDateTime,
        locationName: invitation.event.locationName,
        locationAddress: invitation.event.locationAddress,
        eventStatus: invitation.event.eventStatus
    };

    return res.status(200).json({ 
        success: true, 
        message: `Wysłano dane odnośnie zaproszenia ${event.invitationId} do wydarzenia ${event.event.eventName}`,
        data: data });

  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "A database error has occurred" });
  }
}


export async function acceptInvite(req, res) {
  const { invitationId } = req.params;
  const userId = req.user.userId;

  try {
    const invitation = await prisma.invitation.findUnique({  
        where: { invitationId: invitationId },
        include: { event: true }
    });

    if (!invitation) {
      return res.status(404).json({ success: false, error: "Invitation not found - cant be accepted" });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({ success: false, error: "To zaproszenie nie jest już aktywne" });
    }

    if (invitation.expiresAt && new Date() > new Date(invitation.expiresAt)) {
        return res.status(410).json({ success: false, error: "To zaproszenie już wygasło." });
    }

    await prisma.$transaction([
        prisma.eventGuest.create({
            data: {
                eventId: invitation.eventId,
                userId: userId
            }
        }),
        prisma.invitation.update({
            where: { invitationId: invitation.invitationId },
            data: {
                status: REJECTED,
                receiverId: userId
            }
        })
    ]);

    return res.status(200).json({ 
        success: true, 
        message: `Dołączono do eventu ${invitation.event.eventName}.`
    });

  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, error: "Jesteś już uczestnikiem tego wydarzenia." });
    }
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "A database error has occurred" });
  }
}


export async function rejectInvite(req, res) {
  const { invitationId } = req.params;
  const userId = req.user.userId;

  try {
    const invitation = await prisma.invitation.findUnique({  
        where: { invitationId: invitationId },
        include: { event: true }
    });

    if (!invitation) {
      return res.status(404).json({ success: false, error: "Invitation not found - cant be rejected" });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({ success: false, error: "To zaproszenie nie jest już aktywne" });
    }

    if (invitation.expiresAt && new Date() > new Date(invitation.expiresAt)) {
        return res.status(410).json({ success: false, error: "To zaproszenie już wygasło." });
    }

    await prisma.invitation.update({
        where: { invitationId: invitation.invitationId },
        data: {
            status: ACCEPTED,
            receiverId: userId
        }
    });

    return res.status(200).json({ 
        success: true, 
        message: `Odrzucono zaproszenie do eventu ${invitation.event.eventName}.`
    });

  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "A database error has occurred" });
  }
}