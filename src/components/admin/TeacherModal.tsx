import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users } from 'lucide-react';
import { Teacher } from '../../types';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
  initialTeacher?: Teacher | null;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTeacher
}) => {
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [nuptk, setNuptk] = useState('');
  const [role, setRole] = useState('Guru Kelas');
  const [education, setEducation] = useState('S1 PGSD');
  const [certificationStatus, setCertificationStatus] = useState<'Tersertifikasi' | 'Dalam Proses' | 'Belum'>('Tersertifikasi');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Perempuan');
  const [assignedClass, setAssignedClass] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [achievementsText, setAchievementsText] = useState('');

  useEffect(() => {
    if (initialTeacher) {
      setName(initialTeacher.name);
      setNip(initialTeacher.nip);
      setNuptk(initialTeacher.nuptk || '');
      setRole(initialTeacher.role);
      setEducation(initialTeacher.education);
      setCertificationStatus(initialTeacher.certificationStatus);
      setGender(initialTeacher.gender);
      setAssignedClass(initialTeacher.assignedClass || '');
      setPhotoUrl(initialTeacher.photoUrl || '');
      setAchievementsText(initialTeacher.achievements ? initialTeacher.achievements.join(', ') : '');
    } else {
      setName('');
      setNip('');
      setNuptk('');
      setRole('Guru Kelas');
      setEducation('S1 PGSD');
      setCertificationStatus('Tersertifikasi');
      setGender('Perempuan');
      setAssignedClass('Kelas I');
      setPhotoUrl('');
      setAchievementsText('');
    }
  }, [initialTeacher, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const achs = achievementsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updatedTeacher: Teacher = {
      id: initialTeacher ? initialTeacher.id : `t-${Date.now()}`,
      name: name.trim(),
      nip: nip.trim(),
      nuptk: nuptk.trim() || undefined,
      role: role.trim(),
      education: education.trim(),
      certificationStatus,
      gender,
      assignedClass: assignedClass.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      achievements: achs.length > 0 ? achs : undefined
    };

    onSave(updatedTeacher);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {initialTeacher ? 'Edit Data Guru & Tendik' : 'Tambah Guru & Tendik Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              SD Negeri 305 Maluku Tengah
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Lengkap & Gelar
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Fatimah Patty, S.Pd."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                NIP (Nomor Induk Pegawai)
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="19810815 200604 2 018"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                NUPTK (Jika Ada)
              </label>
              <input
                type="text"
                value={nuptk}
                onChange={(e) => setNuptk(e.target.value)}
                placeholder="4532759660300013"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jabatan / Tugas Mengajar
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Guru Kelas I / Guru PAI"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Rombel / Tugas Tambahan
              </label>
              <input
                type="text"
                value={assignedClass}
                onChange={(e) => setAssignedClass(e.target.value)}
                placeholder="Kelas 1 (Fase A) / Koord. P5"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pendidikan Terakhir
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="S1 PGSD / S2 Manajemen"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status Sertifikasi Pendidik
              </label>
              <select
                value={certificationStatus}
                onChange={(e) => setCertificationStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
              >
                <option value="Tersertifikasi">Tersertifikasi</option>
                <option value="Dalam Proses">Dalam Proses (PPG)</option>
                <option value="Belum">Belum Sertifikasi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
              >
                <option value="Perempuan">Perempuan</option>
                <option value="Laki-laki">Laki-laki</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                URL Foto Guru (Opsional)
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Prestasi / Penghargaan (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={achievementsText}
              onChange={(e) => setAchievementsText(e.target.value)}
              placeholder="Guru Penggerak Angkatan 7, Finalis Inovasi..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
            >
              Simpan Data GTK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
