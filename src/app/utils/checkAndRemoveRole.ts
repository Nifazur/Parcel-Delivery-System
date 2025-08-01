import { Parcel } from "../modules/parcel/parcel.model";
import { Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";


type RoleType = Role.SENDER | Role.RECEIVER;

export const checkAndRemoveRole = async (
    userId: string,
    roleToCheck: RoleType,
    parcelField: 'sender' | 'receiver'
) => {
    const stillHasRole = await Parcel.findOne({
        [parcelField]: userId,
        status: { $nin: ['delivered', 'cancelled'] },
    });


    if (!stillHasRole) {
        const user = await User.findById(userId);
        if (user && user.role.includes(roleToCheck)) {
            user.role = user.role.filter((r: string) => r !== roleToCheck);
            await user.save();
        }
    }
};