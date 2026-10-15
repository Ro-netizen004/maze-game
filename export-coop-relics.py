"""Export the user-supplied co-op pendants and ring as small grounded props."""
import os
import math
import bpy
from mathutils import Vector, Matrix

workspace=os.path.dirname(os.path.abspath(__file__))
assets=[('eclipse-ember','moon_pendant.glb'),('watcher-ember','iluminati_eye_symbol__free.glb'),('silver-ember','celtic_silver_ring.glb')]
for name,filename in assets:
    if os.environ.get('COOP_RELIC_ONLY') and os.environ['COOP_RELIC_ONLY']!=name:
        continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(workspace,'src',filename))
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
    orientation=Matrix.Rotation(-math.pi/2,4,'Z') if name=='watcher-ember' else Matrix.Identity(4)
    points=[orientation@o.matrix_world@Vector(c) for o in meshes for c in o.bound_box]
    low=Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high=Vector(tuple(max(p[i] for p in points) for i in range(3)))
    center=(low+high)/2
    scale=0.55/max(high-low)
    for obj in meshes:
        matrix=orientation@obj.matrix_world;obj.parent=None
        for vertex in obj.data.vertices:
            vertex.co=(matrix@vertex.co-Vector((center.x,center.y,low.z)))*scale
        obj.matrix_world.identity()
        bpy.context.view_layer.objects.active=obj
        if len(obj.data.polygons)>6000:
            modifier=obj.modifiers.new('Browser detail','DECIMATE')
            modifier.ratio=6000/len(obj.data.polygons)
            bpy.ops.object.modifier_apply(modifier=modifier.name)
        obj.select_set(True)
    for image in bpy.data.images:
        if max(image.size)>512:
            factor=512/max(image.size)
            image.scale(max(1,round(image.size[0]*factor)),max(1,round(image.size[1]*factor)))
        if image.pixels:image.pack()
    output=os.path.join(workspace,'public/models',name)
    os.makedirs(output,exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(output,name+'.glb'),export_format='GLB',use_selection=True,
        export_yup=True,export_animations=False,export_cameras=False,export_lights=False)
    print('RELIC',name,'dimensions',tuple((high-low)*scale),'bytes',os.path.getsize(os.path.join(output,name+'.glb')))
    if os.environ.get('COOP_RELIC_PREVIEWS'):
        scene=bpy.context.scene
        bpy.ops.object.camera_add(location=(0,-1.15,0.6))
        camera=bpy.context.object
        camera.rotation_euler=(Vector((0,0,0.23))-camera.location).to_track_quat('-Z','Y').to_euler()
        scene.camera=camera
        for position,energy in [((0,-1,1.5),100),((1,0,1),60)]:
            bpy.ops.object.light_add(type='AREA',location=position)
            bpy.context.object.data.energy=energy;bpy.context.object.data.size=2
        scene.world=bpy.data.worlds.new('Review');scene.world.color=(0.15,0.15,0.15)
        scene.render.engine='CYCLES';scene.cycles.samples=12
        scene.render.resolution_x=384;scene.render.resolution_y=384;scene.render.resolution_percentage=100
        scene.render.filepath=os.path.join(os.environ['COOP_RELIC_PREVIEWS'],name+'.png')
        bpy.ops.render.render(write_still=True)
